package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.NotificationMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.NotificationRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.specification.NotificationSpecs;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ thông báo (Notification).
 *
 * <p>Hỗ trợ:
 * <ul>
 *   <li>Gửi thông báo cá nhân hoặc broadcast.</li>
 *   <li>Gửi real-time qua WebSocket (STOMP) bằng {@link SimpMessagingTemplate}.</li>
 *   <li>Truy vấn danh sách thông báo theo quyền (admin/owner/tenant) và thao tác unread/read.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepo;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final Gson gson = new Gson();

    /**
     * Gửi thông báo cá nhân cho một user.
     *
     * @param userId id người nhận
     * @param title tiêu đề
     * @param message nội dung
     * @param type type/key sự kiện
     * @param data payload kèm theo (sẽ được serialize JSON)
     */
    @Override
    public void sendToUser(Integer userId, String title, String message, String type, Object data) {
        User recipient = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification noti = Notification.builder()
                .recipient(recipient)
                .senderId(SecurityUtils.getCurrentUserId())
                .title(title)
                .message(message)
                .isRead(false)
                .type(type)
                .data(data != null ? gson.toJson(data) : null)
                .isBroadcast(false)
                .build();

        notificationRepo.save(noti);
        messagingTemplate.convertAndSendToUser(
                userId.toString(), "/queue/notifications", notificationMapper.toResponse(noti));
    }

    /**
     * Gửi thông báo broadcast tới toàn hệ thống.
     *
     * @param title tiêu đề
     * @param message nội dung
     * @param type type/key sự kiện
     * @param data payload kèm theo (sẽ được serialize JSON)
     */
    @Override
    public void sendToAll(String title, String message, String type, Object data) {
        Notification noti = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .data(data != null ? gson.toJson(data) : null)
                .senderId(SecurityUtils.getCurrentUserId())
                .isBroadcast(true)
                .build();

        notificationRepo.save(noti);

        // Gửi real-time cho tất cả user đang online
        messagingTemplate.convertAndSend("/topic/notifications", notificationMapper.toResponse(noti));
    }

    /**
     * Gửi thông báo tới tất cả tenant đang active thuộc một owner.
     *
     * @param ownerId id owner
     * @param title tiêu đề
     * @param message nội dung
     * @param type type/key sự kiện
     * @param data payload kèm theo
     */
    @Override
    public void sendToAllTenantsOfOwner(Integer ownerId, String title, String message, String type, Object data) {
        List<User> tenants = userRepository.findActiveTenantsByOwnerId(ownerId);
        if (tenants.isEmpty()) return;

        for (User tenant : tenants) {
            sendToUser(tenant.getId(), title, message, type, data);
        }
    }

    // Gọi khi tạo hóa đơn hoặc gần đến hạn
    /**
     * Gửi nhắc thanh toán hóa đơn theo billId.
     *
     * @param billId id bill
     */
    @Override
    public void sendBillReminder(Integer billId) {
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        Map<String, Object> data = Map.of(
                "billId", bill.getId(),
                "amount", bill.getAmount(),
                "dueDate", bill.getDueDate() != null ? bill.getDueDate().toString() : null,
                "roomNumber", bill.getRoom().getRoomNumber());

        sendToUser(
                bill.getContract().getTenant().getUser().getId(),
                "Nhắc thanh toán hóa đơn",
                "Hóa đơn phòng " + bill.getRoom().getRoomNumber() + " sắp đến hạn: " + bill.getAmount() + "đ",
                "BILL_REMINDER",
                data);
    }

    //    @Override
    //    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
    //        User user = SecurityUtils.getCurrentUser();
    //        Specification<Notification> spec;
    //
    //        if (SecurityUtils.isAdmin()) {
    //            spec = Specification.where(null);
    //        } else if (SecurityUtils.isOwner()) {
    //            spec = NotificationSpecs.visibleToOwner(user);
    //        } else {
    //            spec = NotificationSpecs.visibleTo(user);
    //        }
    //
    //        Pageable sorted = PageRequest.of(
    //                pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    //
    //        return notificationRepo.findAll(spec, sorted).map(notificationMapper::toResponse);
    //    }

    @Override
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();

        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending().and(Sort.by("id").descending()));

        Page<Notification> page;

        if (SecurityUtils.isAdmin()) {
            // ADMIN: CHỈ thấy broadcast + thông báo gửi riêng cho admin
            page = notificationRepo.findByIsBroadcastIsTrueOrRecipient(currentUser, sorted);

        } else if (SecurityUtils.isOwner()) {
            // OWNER: thấy của mình + của khách trọ
            page = notificationRepo.findVisibleToOwner(currentUser, sorted);

        } else {
            // USER/TENANT: chỉ thấy của mình + broadcast
            page = notificationRepo.findByRecipientOrIsBroadcastIsTrue(currentUser, sorted);
        }

        return page.map(notificationMapper::toResponse);
    }

    /**
     * Đếm số notification chưa đọc theo user hiện tại (lọc theo quyền hiển thị).
     *
     * @return unread count
     */
    @Override
    public long countUnread() {
        User user = SecurityUtils.getCurrentUser();
        Specification<Notification> spec = NotificationSpecs.isUnread();

        if (!SecurityUtils.isAdmin()) {
            spec = spec.and(
                    SecurityUtils.isOwner()
                            ? NotificationSpecs.visibleToOwner(user)
                            : NotificationSpecs.visibleTo(user));
        }
        return notificationRepo.count(spec);
    }

    /**
     * Đánh dấu một notification là đã đọc.
     *
     * @param notificationId id notification
     */
    @Override
    public void markAsRead(Integer notificationId) {
        Notification noti = notificationRepo
                .findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        User currentUser = SecurityUtils.getCurrentUserOrThrow();

        if (Boolean.FALSE.equals(noti.getIsBroadcast())) {
            if (noti.getRecipient() == null || !noti.getRecipient().getId().equals(currentUser.getId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }

        noti.setIsRead(true);
        noti.setReadAt(LocalDateTime.now());
        notificationRepo.save(noti);
    }

    /**
     * Đánh dấu tất cả notification có thể nhìn thấy của user hiện tại là đã đọc.
     */
    @Override
    public void markAllAsRead() {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();

        Specification<Notification> spec;

        if (SecurityUtils.isAdmin()) {
            spec = NotificationSpecs.broadcast()
                    .or(NotificationSpecs.personalTo(currentUser))
                    .and(NotificationSpecs.isUnread());
        } else if (SecurityUtils.isOwner()) {
            spec = NotificationSpecs.visibleToOwner(currentUser).and(NotificationSpecs.isUnread());
        } else {
            spec = NotificationSpecs.visibleTo(currentUser).and(NotificationSpecs.isUnread());
        }

        List<Notification> unreadNotis = notificationRepo.findAll(spec);

        unreadNotis.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });

        notificationRepo.saveAll(unreadNotis);
    }
}

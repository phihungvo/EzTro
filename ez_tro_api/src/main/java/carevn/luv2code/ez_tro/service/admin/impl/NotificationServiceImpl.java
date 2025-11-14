package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;

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
import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.NotificationMapper;
import carevn.luv2code.ez_tro.repository.NotificationRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.specification.NotificationSpecs;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepo;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @Override
    public void sendToUser(Integer userId, String title, String message, String type, Object data) {
        User recipient = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .senderId(SecurityUtils.getCurrentUserId())
                .title(title)
                .message(message)
                .type(type)
                .data(data != null ? new Gson().toJson(data) : null)
                .build();

        notificationRepo.save(notification);

        NotificationResponse response = notificationMapper.toResponse(notification);

        // Gửi real-time
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", response);
    }

    @Override
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()));

        Specification<Notification> spec;

        if (isAdmin) {
            spec = NotificationSpecs.visibleToAll();
        } else if (SecurityUtils.isOwner()) {
            spec = NotificationSpecs.ownedByOwner(currentUser);
        } else {
            spec = NotificationSpecs.sentToUser(currentUser);
        }

        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));

        return notificationRepo.findAll(spec, sorted).map(notificationMapper::toResponse);
    }

    @Override
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        User currentUser = SecurityUtils.getCurrentUser();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepo.save(notification);
    }

    @Override
    public Integer countUnread() {
        User currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()));

        Specification<Notification> spec;

        if (isAdmin) {
            spec = NotificationSpecs.visibleToAll().and(NotificationSpecs.isUnread());
        } else if (SecurityUtils.isOwner()) {
            spec = NotificationSpecs.ownedByOwner(currentUser).and(NotificationSpecs.isUnread());
        } else {
            spec = NotificationSpecs.sentToUser(currentUser).and(NotificationSpecs.isUnread());
        }

        return (int) notificationRepo.count(spec);
    }
}

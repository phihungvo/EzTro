package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.dto.requests.MailRequest;
import carevn.luv2code.ez_tro.dto.requests.TemplateMailRequest;
import carevn.luv2code.ez_tro.service.admin.MailService;
import jakarta.validation.Valid;

/**
 * REST Controller gửi email (plain/html/template) với tùy chọn đính kèm file.
 *
 * <p>Nghiệp vụ gửi mail được xử lý tại {@link MailService}.
 */
@RestController
@RequestMapping("/api/mail")
public class MailController {

    private final MailService mailService;

    public MailController(MailService mailService) {
        this.mailService = mailService;
    }

    /**
     * Gửi email (plain text hoặc HTML).
     *
     * @param request payload gửi mail
     * @return "OK" nếu gửi thành công
     */
    @PostMapping("/send")
    public ResponseEntity<?> send(@Valid @RequestBody MailRequest request) {
        mailService.send(request);
        return ResponseEntity.ok().body("OK");
    }

    /**
     * Gửi email kèm attachments (multipart/form-data).
     *
     * @param request payload gửi mail
     * @param attachments danh sách file đính kèm (có thể null)
     * @return "OK" nếu gửi thành công
     */
    @PostMapping(
            value = "/send-with-attachments",
            consumes = {"multipart/form-data"})
    public ResponseEntity<?> sendWithAttachments(
            @RequestPart("payload") @Valid MailRequest request,
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {
        mailService.sendWithAttachments(request, attachments == null ? new MultipartFile[0] : attachments);
        return ResponseEntity.ok().body("OK");
    }

    /**
     * Gửi email từ template (Thymeleaf).
     *
     * @param request payload template + variables
     * @return "OK" nếu gửi thành công
     */
    @PostMapping("/send-template")
    public ResponseEntity<?> sendTemplate(@Valid @RequestBody TemplateMailRequest request) {
        mailService.sendTemplate(request);
        return ResponseEntity.ok().body("OK");
    }

    /**
     * Gửi email từ template kèm attachments (multipart/form-data).
     *
     * @param request payload template + variables
     * @param attachments danh sách file đính kèm (có thể null)
     * @return "OK" nếu gửi thành công
     */
    @PostMapping(
            value = "/send-template-with-attachments",
            consumes = {"multipart/form-data"})
    public ResponseEntity<?> sendTemplateWithAttachments(
            @RequestPart("payload") @Valid TemplateMailRequest request,
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {
        mailService.sendTemplateWithAttachments(request, attachments == null ? new MultipartFile[0] : attachments);
        return ResponseEntity.ok().body("OK");
    }
}

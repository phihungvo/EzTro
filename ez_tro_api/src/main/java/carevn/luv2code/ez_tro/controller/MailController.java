package carevn.luv2code.ez_tro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.dto.requests.MailRequest;
import carevn.luv2code.ez_tro.dto.requests.TemplateMailRequest;
import carevn.luv2code.ez_tro.service.MailService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private final MailService mailService;

    public MailController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@Valid @RequestBody MailRequest request) {
        mailService.send(request);
        return ResponseEntity.ok().body("OK");
    }

    @PostMapping(
            value = "/send-with-attachments",
            consumes = {"multipart/form-data"})
    public ResponseEntity<?> sendWithAttachments(
            @RequestPart("payload") @Valid MailRequest request,
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments) {
        mailService.sendWithAttachments(request, attachments == null ? new MultipartFile[0] : attachments);
        return ResponseEntity.ok().body("OK");
    }

    @PostMapping("/send-template")
    public ResponseEntity<?> sendTemplate(@Valid @RequestBody TemplateMailRequest request) {
        mailService.sendTemplate(request);
        return ResponseEntity.ok().body("OK");
    }

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

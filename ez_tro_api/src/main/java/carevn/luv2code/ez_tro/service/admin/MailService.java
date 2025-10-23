package carevn.luv2code.ez_tro.service.admin;

import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.dto.requests.MailRequest;
import carevn.luv2code.ez_tro.dto.requests.TemplateMailRequest;

public interface MailService {
    void send(MailRequest request);

    void sendWithAttachments(MailRequest request, MultipartFile[] attachments);

    void sendTemplate(TemplateMailRequest request);

    void sendTemplateWithAttachments(TemplateMailRequest request, MultipartFile[] attachments);
}

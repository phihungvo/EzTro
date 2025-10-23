package carevn.luv2code.ez_tro.service.admin.impl;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import carevn.luv2code.ez_tro.dto.requests.MailRequest;
import carevn.luv2code.ez_tro.dto.requests.TemplateMailRequest;
import carevn.luv2code.ez_tro.service.admin.MailService;
import jakarta.mail.internet.MimeMessage;

@Service
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public MailServiceImpl(JavaMailSender mailSender, @Nullable TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void send(MailRequest request) {
        if (!request.isHtml()) {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(toArray(request.getTo()));
            setCcBcc(msg, request.getCc(), request.getBcc());
            msg.setSubject(request.getSubject());
            msg.setText(request.getBody());
            mailSender.send(msg);
            return;
        }
        sendMime(
                null,
                request.getTo(),
                request.getCc(),
                request.getBcc(),
                request.getSubject(),
                request.getBody(),
                true);
    }

    @Override
    public void sendWithAttachments(MailRequest request, MultipartFile[] attachments) {
        sendMime(
                attachments,
                request.getTo(),
                request.getCc(),
                request.getBcc(),
                request.getSubject(),
                request.getBody(),
                request.isHtml());
    }

    @Override
    public void sendTemplate(TemplateMailRequest request) {
        String html = renderTemplate(request.getTemplateName(), request.getVariables());
        sendMime(null, request.getTo(), request.getCc(), request.getBcc(), request.getSubject(), html, true);
    }

    @Override
    public void sendTemplateWithAttachments(TemplateMailRequest request, MultipartFile[] attachments) {
        String html = renderTemplate(request.getTemplateName(), request.getVariables());
        sendMime(attachments, request.getTo(), request.getCc(), request.getBcc(), request.getSubject(), html, true);
    }

    private String[] toArray(List<String> emails) {
        return CollectionUtils.isEmpty(emails) ? new String[0] : emails.toArray(new String[0]);
    }

    private void setCcBcc(SimpleMailMessage msg, List<String> cc, List<String> bcc) {
        if (!CollectionUtils.isEmpty(cc)) msg.setCc(toArray(cc));
        if (!CollectionUtils.isEmpty(bcc)) msg.setBcc(toArray(bcc));
    }

    private void sendMime(
            @Nullable MultipartFile[] attachments,
            List<String> to,
            List<String> cc,
            List<String> bcc,
            String subject,
            String content,
            boolean isHtml) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mime, attachments != null && attachments.length > 0, StandardCharsets.UTF_8.name());
            helper.setTo(toArray(to));
            if (!CollectionUtils.isEmpty(cc)) helper.setCc(toArray(cc));
            if (!CollectionUtils.isEmpty(bcc)) helper.setBcc(toArray(bcc));
            helper.setSubject(subject);
            helper.setText(content, isHtml);

            if (attachments != null) {
                for (MultipartFile file : attachments) {
                    if (file != null && !file.isEmpty()) {
                        helper.addAttachment(file.getOriginalFilename(), file);
                    }
                }
            }
            mailSender.send(mime);
        } catch (Exception e) {
            throw new RuntimeException("Gửi mail thất bại: " + e.getMessage(), e);
        }
    }

    private String renderTemplate(String templateName, @Nullable Map<String, Object> variables) {
        if (templateEngine == null) {
            throw new IllegalStateException(
                    "Thiếu TemplateEngine. Hãy thêm dependency thymeleaf hoặc tắt gửi template.");
        }
        Context ctx = new Context();
        if (variables != null) variables.forEach(ctx::setVariable);
        return templateEngine.process(templateName, ctx);
    }
}

package carevn.luv2code.ez_tro.util;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import carevn.luv2code.ez_tro.configuration.RequestIdFilter;

public final class RequestAuditUtils {

    public static final String IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

    private RequestAuditUtils() {}

    public static String getCurrentRequestId() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servletAttributes)) {
            return null;
        }

        Object requestId = servletAttributes.getRequest().getAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE);
        return requestId == null ? null : requestId.toString();
    }

    public static String getCurrentIdempotencyKey() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servletAttributes)) {
            return null;
        }

        String key = servletAttributes.getRequest().getHeader(IDEMPOTENCY_KEY_HEADER);
        return key == null || key.isBlank() ? null : key.trim();
    }

    public static boolean hasCurrentHttpRequest() {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes;
    }
}

package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;

public interface PaymentNotificationService {

    void notifyTenantSubmitted(Payment payment);

    void notifyBackofficePaymentReceived(Payment payment);

    void notifyPaymentConfirmed(Payment payment);

    void notifyPaymentAllocated(Payment payment, List<PaymentAllocation> allocations, boolean autoAllocation);

    void notifyPaymentReversed(Payment payment, String note);
}

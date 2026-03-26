package carevn.luv2code.ez_tro.util;

import java.time.LocalDate;
import java.util.Objects;

import carevn.luv2code.ez_tro.enums.InvoiceType;

public final class BillingKeyUtils {

    private BillingKeyUtils() {}

    public static String buildGenerationKey(
            Integer organizationId,
            Integer contractId,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            InvoiceType invoiceType) {

        return "ORG:"
                + Objects.toString(organizationId, "null")
                + "|CONTRACT:"
                + Objects.toString(contractId, "null")
                + "|START:"
                + Objects.toString(billingPeriodStart, "null")
                + "|END:"
                + Objects.toString(billingPeriodEnd, "null")
                + "|TYPE:"
                + Objects.toString(invoiceType, "null");
    }
}

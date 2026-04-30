import { useState, useCallback, useEffect } from "react";
import { Alert, message } from "antd";
import { useNavigate } from "react-router-dom";
import Toast from "~/components/Layout/AdminLayout/components/Toast";
import RoomSelector from "../RoomSelector";
import RentSectionCard from "../RentSection";
import UtilitySectionCard from "../UtilitySection";
import ExtrasSectionCard from "../ExtrasSection";
import {
    DiscountSection as DiscountSectionCard,
    PaymentSection as PaymentSectionCard,
    NotesSection as NotesSectionCard,
} from "../DiscountSection";
import SummaryPanel from "../SummaryPanel";
import PreviewModalCard from "../PreviewModal";
import ServicesSection from "~/pages/Admin/Bill/component/ServicesSection";
import styles from "./BillCreator.module.scss";
import { getCreatorBillContext } from "~/service/admin/room";
import { upsertMeterReading } from "~/service/admin/meter-reading";
import { getUtilityByBoardingHouse } from "~/service/admin/boarding_house";
import { getContractSnapshot } from "~/service/admin/contract";
import { finalizeInvoice, previewInvoice } from "~/service/admin/billing";
import {
    getContractReconciliation,
    getCreditLedgerReport,
    getDebtAgingReport,
} from "~/service/admin/reconciliation";
import { getBillingAuditLogs } from "~/service/admin/billing-audit";
import { getBillingUiErrorMessage } from "~/utils/apiError";
import { sendBill } from "~/service/admin/bill";

const pad2 = (n) => String(n).padStart(2, "0");

const shiftDateToMonthYear = (dateStr, month, year) => {
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    const parts = dateStr.split("-").map((p) => Number(p));
    if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return dateStr;
    const [, , day] = parts;
    const lastDay = new Date(year, month, 0).getDate();
    const safeDay = Math.max(1, Math.min(day, lastDay));
    return `${year}-${pad2(month)}-${pad2(safeDay)}`;
};

const sumMeterLineAmount = (reading) => {
    const prev = Number(reading.previousIndex || 0);
    const curr = reading.currentIndex === "" || reading.currentIndex == null ? null : Number(reading.currentIndex);
    const price = Number(reading.unitPrice || 0);
    if (curr == null) return 0;
    return Math.max(0, (curr - prev) * price);
};

const calculateFixedServiceTotal = (service) => {
    const quantity = Math.max(1, Number(service.quantity || 1));
    const unitPrice = Math.max(0, Number(service.unitPrice || 0));
    return quantity * unitPrice;
};

const INITIAL = {
    room: null,
    roomId: null,
    contractId: null,
    month: 3,
    year: 2026,
    periodType: "monthly",
    issueDate: "2026-03-07",
    dueDate: "2026-03-15",
    roomPrice: 3500000,
    daysInMonth: 31,
    meterReadings: [],
    fixedServices: [],
    extras: [],
    extraNextId: 1,
    discountType: "none",
    discountVal: 0,
    discountReason: "",
    lateFee: true,
    paymentMethod: "cash",
    notePublic: "Vui lòng thanh toán trước hạn. Cảm ơn!",
    noteInternal: "",
    paymentInstructions: "Vui lòng ghi rõ mã phòng và kỳ thanh toán khi chuyển khoản.",
    sendZalo: true,
    sendSms: true,
    sendEmail: false,
    sendNow: true,
    tenantName: "",
    tenantPhone: "",
    monthsRemaining: 0,
    contractEndDate: "",
    currentOccupants: 0,
    floorNumber: 1,
    boardingHouseId: null,
    contractVersion: null,
    contractSnapshot: null,
    organizationName: "",
};

export default function InvoiceCreator() {
    const [state, setState] = useState(INITIAL);
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [context, setContext] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [toast, setToast] = useState(null);
    const [publishing, setPublishing] = useState(false);
    const [reconciliation, setReconciliation] = useState(null);
    const [reconciliationLoading, setReconciliationLoading] = useState(false);
    const [agingReport, setAgingReport] = useState(null);
    const [creditLedger, setCreditLedger] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [insightLoading, setInsightLoading] = useState(false);
    const navigate = useNavigate();

    const patch = useCallback((updates) => setState((prev) => ({ ...prev, ...updates })), []);
    const setPeriod = useCallback((nextMonth, nextYear) => {
        setState((prev) => ({
            ...prev,
            month: nextMonth,
            year: nextYear,
            issueDate: shiftDateToMonthYear(prev.issueDate, nextMonth, nextYear),
            dueDate: shiftDateToMonthYear(prev.dueDate, nextMonth, nextYear),
        }));
    }, []);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const handleSelectRoom = useCallback((roomNumber, roomData) => {
        setState((prev) => ({
            ...prev,
            room: roomNumber,
            roomId: roomData?.roomId || null,
            contractId: roomData?.contractId || null,
            tenantName: roomData?.tenantName || "",
            tenantPhone: roomData?.tenantPhone || "",
            monthsRemaining: roomData?.monthsRemaining || 0,
            contractEndDate: roomData?.contractEndDate || "Vô thời hạn",
            currentOccupants: roomData?.currentOccupants || 0,
            floorNumber: roomData?.floorNumber || 1,
            boardingHouseId: roomData?.boardingHouseId || null,
        }));
        setContext(null);
        setPreview(null);
        setPreviewError(null);
        setShowPreview(false);
    }, []);

    useEffect(() => {
        const fetchContext = async () => {
            if (!state.roomId || !state.boardingHouseId || !state.month || !state.year) return;
        const resp = await getCreatorBillContext(state.roomId, state.month, state.year);
        if (!resp || resp.code !== 200 || !resp.result) return;

        const ctx = resp.result;
        setContext(ctx);
        const [boardingHouseUtilities, contractSnapshot] = await Promise.all([
            getUtilityByBoardingHouse(state.boardingHouseId),
            ctx.contractId ? getContractSnapshot(ctx.contractId, `${state.year}-${pad2(state.month)}-01`) : null,
        ]);

            const currentVersion = contractSnapshot?.currentVersion || null;
            const rentPrice = Number(currentVersion?.price ?? ctx.rentPrice ?? 0);
            const meterReadings = Array.isArray(ctx.meterReadings) ? ctx.meterReadings : [];
            const fixedServices = Array.isArray(ctx.fixedChargeUtilities) ? ctx.fixedChargeUtilities : [];
            const usageBasedUtilities = Array.isArray(ctx.usageBasedUtilities) ? ctx.usageBasedUtilities : [];
                const roomMeterById = new Map(meterReadings.map((item) => [item.utilityId, item]));
            const roomFixedById = new Map(fixedServices.map((item) => [item.id, item]));
            const allUtilities = Array.isArray(boardingHouseUtilities) ? boardingHouseUtilities : [];

            setState((prev) => ({
                ...prev,
                contractId: ctx.contractId || null,
                roomPrice: rentPrice,
                contractVersion: currentVersion,
                contractSnapshot: contractSnapshot || null,
                organizationName: contractSnapshot?.organizationName || "",
                meterReadings: usageBasedUtilities.map((item) => {
                    const meterItem = roomMeterById.get(item.id);
                    const utilityDef = allUtilities.find((utility) => utility.id === item.id);
                    return {
                        utilityId: item.id,
                        utilityName: item.name,
                        unit: item.unit,
                        previousIndex: Number(meterItem?.previousIndex || 0),
                        currentIndex: meterItem?.currentIndex == null ? "" : String(meterItem.currentIndex),
                        unitPrice: Number(meterItem?.unitPrice ?? utilityDef?.unitPrice ?? item.unitPrice ?? 0),
                    };
                }),
                fixedServices: allUtilities
                    .filter((item) => item.type !== "USAGE_BASED")
                    .map((item) => {
                    const roomItem = roomFixedById.get(item.id);
                    const quantity = Math.max(1, Number(roomItem?.quantity || 1));
                    const unitPrice = Math.max(0, Number(roomItem?.unitPrice ?? item.unitPrice ?? 0));
                    return {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        unit: item.unit,
                        checked: Boolean(roomItem),
                        quantity,
                        unitPrice,
                        usageAmount: roomItem?.usageAmount,
                        totalAmount: roomItem ? calculateFixedServiceTotal({ quantity, unitPrice }) : 0,
                    };
                }),
            }));
        };

        fetchContext();
    }, [state.roomId, state.boardingHouseId, state.month, state.year]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!state.contractId) {
                setReconciliation(null);
                setAgingReport(null);
                setCreditLedger(null);
                setAuditLogs([]);
                return;
            }
            setReconciliationLoading(true);
            setInsightLoading(true);
            try {
                const [report, aging, ledger, logs] = await Promise.all([
                    getContractReconciliation(state.contractId),
                    getDebtAgingReport(state.contractId),
                    getCreditLedgerReport(state.contractId),
                    getBillingAuditLogs({ contractId: state.contractId }),
                ]);
                if (!cancelled) {
                    setReconciliation(report);
                    setAgingReport(aging);
                    setCreditLedger(ledger);
                    setAuditLogs(logs || []);
                }
            } catch (error) {
                if (!cancelled) {
                    setReconciliation(null);
                    setAgingReport(null);
                    setCreditLedger(null);
                    setAuditLogs([]);
                }
            } finally {
                if (!cancelled) {
                    setReconciliationLoading(false);
                    setInsightLoading(false);
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [state.contractId]);

    const onMeterCurrentChange = useCallback((utilityId, value) => {
        setState((prev) => ({
            ...prev,
            meterReadings: (prev.meterReadings || []).map((r) =>
                r.utilityId === utilityId ? { ...r, currentIndex: value } : r
            ),
        }));
    }, []);

    const onMeterPriceChange = useCallback((utilityId, value) => {
        const price = parseFloat(value);
        setState((prev) => ({
            ...prev,
            meterReadings: (prev.meterReadings || []).map((r) =>
                r.utilityId === utilityId ? { ...r, unitPrice: Number.isFinite(price) ? price : 0 } : r
            ),
        }));
    }, []);

    const onFixedServiceQuantityChange = useCallback((serviceId, value) => {
        const quantity = Math.max(1, Number(value || 1));
        setState((prev) => ({
            ...prev,
            fixedServices: (prev.fixedServices || []).map((item) =>
                item.id === serviceId
                    ? { ...item, quantity, totalAmount: calculateFixedServiceTotal({ ...item, quantity }) }
                    : item
            ),
        }));
    }, []);

    const onFixedServiceToggle = useCallback((serviceId) => {
        setState((prev) => ({
            ...prev,
            fixedServices: (prev.fixedServices || []).map((item) => {
                if (item.id !== serviceId) return item;
                const checked = !item.checked;
                return {
                    ...item,
                    checked,
                    totalAmount: checked ? calculateFixedServiceTotal(item) : 0,
                };
            }),
        }));
    }, []);

    const onFixedServicePriceChange = useCallback((serviceId, value) => {
        const unitPrice = Math.max(0, Number(value || 0));
        setState((prev) => ({
            ...prev,
            fixedServices: (prev.fixedServices || []).map((item) =>
                item.id === serviceId
                    ? { ...item, unitPrice, totalAmount: calculateFixedServiceTotal({ ...item, unitPrice }) }
                    : item
            ),
        }));
    }, []);

    const meterTotal = (state.meterReadings || []).reduce((sum, reading) => sum + sumMeterLineAmount(reading), 0);
    const fixedServicesTotal = (state.fixedServices || []).reduce((sum, item) => {
        if (!item.checked) return sum;
        return sum + Number(item.totalAmount || 0);
    }, 0);
    const extrasTotal = state.extras.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const subtotal = state.roomPrice + meterTotal + fixedServicesTotal + extrasTotal;
    const discount = state.discountType === "percent"
        ? Math.round(subtotal * state.discountVal / 100)
        : state.discountType === "fixed" ? Number(state.discountVal || 0) : 0;
    const total = Math.max(0, subtotal - discount);
    const computed = { meterTotal, fixedServicesTotal, extrasTotal, subtotal, discount, total };

    const buildPreviewPayload = useCallback(() => {
        if (!state.contractId) {
            return null;
        }
        const monthStr = pad2(state.month);
        const periodStart = `${state.year}-${monthStr}-01`;
        const lastDay = new Date(state.year, state.month, 0).getDate();
        const periodEnd = `${state.year}-${monthStr}-${pad2(lastDay)}`;
        const fixedServices = (state.fixedServices || [])
            .filter((item) => item.checked)
            .map((item) => ({
                utilityId: item.utilityId || item.id || null,
                utilityName: item.name || "",
                type: item.type || null,
                unit: item.unit || null,
                unitPrice: Number(item.unitPrice || 0),
                quantity: Math.max(1, Number(item.quantity || 1)),
                checked: true,
            }));

        return {
            contractId: state.contractId,
            asOfDate: state.issueDate,
            billingPeriodStart: periodStart,
            billingPeriodEnd: periodEnd,
            dueDate: state.dueDate,
            invoiceType: "MANUAL",
            fixedServices,
            extraAmount: extrasTotal,
            discountAmount: discount,
            discountReason: state.discountReason,
            publicNote: state.notePublic,
            internalNote: state.noteInternal,
            paymentInstructions: state.paymentInstructions,
        };
    }, [
        state.contractId,
        state.issueDate,
        state.month,
        state.year,
        state.dueDate,
        state.fixedServices,
        state.discountReason,
        state.notePublic,
        state.noteInternal,
        state.paymentInstructions,
        extrasTotal,
        discount,
    ]);

    const persistMeterReadings = useCallback(async () => {
        const readings = state.meterReadings || [];
        if (!state.roomId || readings.length === 0) {
            return;
        }
        await Promise.all(
            readings.map((item) =>
                upsertMeterReading({
                    roomId: state.roomId,
                    utilityId: item.utilityId,
                    periodMonth: state.month,
                    periodYear: state.year,
                    currentIndex: Number(item.currentIndex),
                    unitPrice: Number(item.unitPrice || 0),
                    note: `Tao hoa don ${state.month}/${state.year}`,
                })
            )
        );
    }, [state.roomId, state.month, state.year, state.meterReadings]);

    const runPreview = useCallback(async () => {
        const payload = buildPreviewPayload();
        if (!payload) {
            throw new Error("Không có dữ liệu hoá đơn để xem trước.");
        }
        const response = await previewInvoice(payload);
        setPreview(response);
        return { payload, response };
    }, [buildPreviewPayload]);

    const validateBeforePublish = useCallback(() => {
        if (!state.roomId || !state.contractId) {
            message.error("Bạn cần chọn phòng có hợp đồng đang hiệu lực.");
            return false;
        }

        const invalidMeter = (state.meterReadings || []).find((item) => {
            if (item.currentIndex === "" || item.currentIndex == null) return true;
            return Number(item.currentIndex) < Number(item.previousIndex || 0);
        });
        if (invalidMeter) {
            message.error(`Chỉ số ${invalidMeter.utilityName} chưa hợp lệ.`);
            return false;
        }

        const serviceAmount = meterTotal + fixedServicesTotal + extrasTotal - discount;
        if (serviceAmount < 0) {
            message.error("Giảm giá đang vượt phần dịch vụ/phát sinh. Vui lòng điều chỉnh trước khi lưu.");
            return false;
        }

        if (!state.dueDate) {
            message.error("Bạn cần nhập hạn thanh toán.");
            return false;
        }

        const dueDateObj = new Date(state.dueDate);
        const startOfPeriod = new Date(state.year, state.month - 1, 1);
        if (dueDateObj < startOfPeriod) {
            message.error("Hạn thanh toán phải nằm trong hoặc sau ngày bắt đầu kỳ.");
            return false;
        }
        if (state.contractSnapshot?.contractStartDate) {
            const contractStart = new Date(state.contractSnapshot.contractStartDate);
            if (dueDateObj < contractStart) {
                message.error("Hạn thanh toán không thể trước khi hợp đồng có hiệu lực.");
                return false;
            }
        }
        if (state.contractSnapshot?.contractEndDate) {
            const contractEnd = new Date(state.contractSnapshot.contractEndDate);
            if (dueDateObj > contractEnd) {
                message.error("Hạn thanh toán không thể sau ngày kết thúc hợp đồng.");
                return false;
            }
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDateObj < today) {
            message.error("Hạn thanh toán không thể nằm trước ngày hiện tại.");
            return false;
        }


        return true;
    }, [
        state.roomId,
        state.contractId,
        state.dueDate,
        state.meterReadings,
        state.year,
        state.month,
        meterTotal,
        fixedServicesTotal,
        extrasTotal,
        discount,
        state.contractSnapshot?.contractStartDate,
        state.contractSnapshot?.contractEndDate,
    ]);

    const handleBillingError = useCallback((error, fallback) => {
        const friendlyMessage = getBillingUiErrorMessage(error, fallback);
        setPreviewError(friendlyMessage);
    }, []);

    const handlePreview = useCallback(async () => {
        if (!validateBeforePublish()) return;

        setPreviewLoading(true);
        setPreviewError(null);
        try {
            await persistMeterReadings();
            const { response } = await runPreview();
            if (!response) {
                setPreviewError("Không thể xem trước hoá đơn");
                return;
            }
            setShowPreview(true);
        } catch (error) {
            console.error("Preview invoice failed", error);
            handleBillingError(error, "Không thể xem trước hoá đơn");
        } finally {
            setPreviewLoading(false);
        }
    }, [validateBeforePublish, persistMeterReadings, runPreview, handleBillingError]);

    const handlePublish = useCallback(async () => {
        if (!validateBeforePublish()) return;

        setPublishing(true);
        try {
            await persistMeterReadings();
            const { payload, response } = await runPreview();
            if (!payload) {
                message.error("Không tìm thấy dữ liệu hoá đơn.");
                return;
            }
            if (response?.hasMissingMeterReadings) {
                setShowPreview(true);
                setPreviewError("Thiếu chỉ số công tơ trong kỳ này. Vui lòng bổ sung trước khi phát hành.");
                message.warning("Thiếu chỉ số công tơ trong kỳ. Hoá đơn chưa thể phát hành.");
                return;
            }
            if (!payload) {
                message.error("Không đủ dữ liệu để tạo hoá đơn.");
                return;
            }
            const bill = await finalizeInvoice(payload);
            if (bill?.id && state.sendNow) {
                await sendBill(bill.id, {
                    sendInApp: true,
                    sendEmail: !!state.sendEmail,
                    sendSms: !!state.sendSms,
                    sendZalo: !!state.sendZalo,
                });
            }
            showToast("✅ Hoá đơn đã được tạo thành công", "success");
            navigate("/owner/bills");
        } catch (error) {
            console.error("Publish bill failed", error);
            handleBillingError(error, "Không thể phát hành hoá đơn");
        } finally {
            setPublishing(false);
        }
    }, [
        validateBeforePublish,
        persistMeterReadings,
        runPreview,
        showToast,
        navigate,
        handleBillingError,
        state.sendNow,
        state.sendEmail,
        state.sendSms,
        state.sendZalo,
    ]);

    const handleSharePaymentInfo = useCallback(async () => {
        const totalAmount = Number(preview?.totalAmount ?? computed.total ?? 0);
        const billingPeriod = preview?.billingPeriodStart && preview?.billingPeriodEnd
            ? `${preview.billingPeriodStart} - ${preview.billingPeriodEnd}`
            : `Tháng ${String(state.month).padStart(2, "0")}/${state.year}`;
        const shareText = [
            preview?.generationKey ? `Hoá đơn: ${preview.generationKey}` : "Thông tin thanh toán",
            `Phòng: ${state.room || "—"}`,
            `Khách thuê: ${state.tenantName || "—"}`,
            `Kỳ tính: ${billingPeriod}`,
            `Hạn thanh toán: ${state.dueDate || "—"}`,
            `Tổng thanh toán: ${totalAmount.toLocaleString("vi-VN")} đ`,
            state.paymentInstructions ? `Hướng dẫn thanh toán: ${state.paymentInstructions}` : null,
            state.notePublic ? `Ghi chú: ${state.notePublic}` : null,
        ].filter(Boolean).join("\n");

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareText);
                showToast("📋 Đã sao chép nội dung thanh toán", "success");
                return;
            }
        } catch (error) {
            console.error("Copy payment info failed", error);
        }

        showToast("Không thể sao chép tự động. Vui lòng cấp quyền clipboard cho trình duyệt.", "info");
    }, [
        computed.total,
        preview,
        showToast,
        state.dueDate,
        state.month,
        state.notePublic,
        state.paymentInstructions,
        state.room,
        state.tenantName,
        state.year,
    ]);

    const roomData = {
        tenant: state.tenantName,
        phone: state.tenantPhone,
        people: state.currentOccupants,
        months_left: state.monthsRemaining,
        floor: state.floorNumber,
    };

    return (
        <div className={styles.app}>
            <div className={styles.page}>
                <div className={styles.formCol}>
                    <RoomSelector
                        selectedRoom={state.room}
                        month={state.month}
                        year={state.year}
                        onSelectRoom={handleSelectRoom}
                        onMonthChange={(m) => setPeriod(m, state.year)}
                        onYearChange={(y) => setPeriod(state.month, y)}
                    />
                    {context?.hasBillThisMonth && (
                    <Alert
                        message="Phòng đã có dữ liệu billing trong kỳ này"
                        description={
                            `Hệ thống đã ghi nhận bill hoặc dữ liệu billing cho kỳ ${state.month}/${state.year}. Khi phát hành, backend sẽ chặn tạo trùng theo generation key nếu kỳ này đã có hóa đơn chính thức.`
                        }
                        type="warning"
                        showIcon
                        style={{ margin: "16px 0" }}
                    />
                    )}
                    <RentSectionCard
                        state={state}
                        onRoomPriceChange={(val) => patch({ roomPrice: val })}
                        onIssueDateChange={(val) => patch({ issueDate: val })}
                    />
                    <UtilitySectionCard
                        state={state}
                        onMeterCurrentChange={onMeterCurrentChange}
                        onMeterPriceChange={onMeterPriceChange}
                    />
                    <ServicesSection
                        state={state}
                        onFixedServiceToggle={onFixedServiceToggle}
                        onFixedServiceQuantityChange={onFixedServiceQuantityChange}
                        onFixedServicePriceChange={onFixedServicePriceChange}
                    />
                    <ExtrasSectionCard
                        extras={state.extras}
                        lateFeeEnabled={state.lateFee}
                        onAddExtra={() => patch({
                            extras: [...state.extras, { id: state.extraNextId, name: "", amount: "" }],
                            extraNextId: state.extraNextId + 1,
                        })}
                        onRemoveExtra={(id) => patch({ extras: state.extras.filter((e) => e.id !== id) })}
                        onExtraChange={(id, field, val) =>
                            patch({
                                extras: state.extras.map((e) =>
                                    e.id === id ? { ...e, [field]: val } : e
                                ),
                            })
                        }
                        onToggleLateFee={() => patch({ lateFee: !state.lateFee })}
                    />
                    <DiscountSectionCard
                        discountType={state.discountType}
                        discountVal={state.discountVal}
                        discountReason={state.discountReason}
                        subtotal={subtotal}
                        onTypeChange={(type) => patch({ discountType: type })}
                        onValChange={(val) => patch({ discountVal: val })}
                        onReasonChange={(val) => patch({ discountReason: val })}
                    />
                    <PaymentSectionCard
                        dueDate={state.dueDate}
                        paymentMethod={state.paymentMethod}
                        onDueDateChange={(val) => patch({ dueDate: val })}
                        onMethodChange={(val) => patch({ paymentMethod: val })}
                    />
                    <NotesSectionCard
                        notePublic={state.notePublic}
                        noteInternal={state.noteInternal}
                        paymentInstructions={state.paymentInstructions}
                        sendZalo={state.sendZalo}
                        sendSms={state.sendSms}
                        sendEmail={state.sendEmail}
                        sendNow={state.sendNow}
                        onNotePublicChange={(val) => patch({ notePublic: val })}
                        onNoteInternalChange={(val) => patch({ noteInternal: val })}
                        onPaymentInstructionsChange={(val) => patch({ paymentInstructions: val })}
                        onToggleZalo={() => patch({ sendZalo: !state.sendZalo })}
                        onToggleSms={() => patch({ sendSms: !state.sendSms })}
                        onToggleEmail={() => patch({ sendEmail: !state.sendEmail })}
                        onToggleSendNow={(val) => patch({ sendNow: val })}
                    />

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={() => navigate("/owner/bills")}
                            style={{
                                flex: 1,
                                padding: "12px 18px",
                                background: "none",
                                borderRadius: 3,
                                color: "var(--text-faint)",
                                fontSize: 13,
                                cursor: "pointer",
                                fontFamily: "var(--font-body)",
                            }}
                        >
                            Huỷ bỏ
                        </button>
                        <button
                            onClick={handlePreview}
                            disabled={previewLoading}
                            style={{
                                flex: 1,
                                padding: "12px 18px",
                                background: "none",
                                border: "1px solid var(--border-cyan)",
                                borderRadius: 3,
                                color: previewLoading ? "var(--text-muted)" : "var(--cyan-mid)",
                                fontSize: 13,
                                cursor: previewLoading ? "not-allowed" : "pointer",
                                fontFamily: "var(--font-body)",
                            }}
                        >
                            {previewLoading ? "Đang tải preview..." : "👁 Xem trước"}
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            style={{
                                flex: 2,
                                padding: "12px 18px",
                                background: "var(--cyan-dim)",
                                border: "1px solid var(--cyan)",
                                borderRadius: 3,
                                color: "var(--cyan)",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: publishing ? "not-allowed" : "pointer",
                                fontFamily: "var(--font-display)",
                                letterSpacing: ".3px",
                                position: "relative",
                                overflow: "hidden",
                                opacity: publishing ? 0.7 : 1,
                            }}
                        >
                            {publishing ? "Đang lưu hoá đơn..." : "✅ Lưu & Phát hành hoá đơn"}
                        </button>
                    </div>
                </div>

                <SummaryPanel
                    state={state}
                    computed={computed}
                    roomData={roomData}
                    preview={preview}
                    previewLoading={previewLoading}
                    depositSummary={context?.depositSummary}
                    depositTransactions={context?.depositTransactions}
                    reconciliation={reconciliation}
                    reconciliationLoading={reconciliationLoading}
                    agingReport={agingReport}
                    creditLedger={creditLedger}
                    auditLogs={auditLogs}
                    insightLoading={insightLoading}
                    previewError={previewError}
                    onPublish={handlePublish}
                    onPreview={handlePreview}
                    onShare={handleSharePaymentInfo}
                />
            </div>

            {showPreview && (
                <PreviewModalCard
                    state={state}
                    computed={computed}
                    preview={preview}
                    loading={previewLoading}
                    error={previewError}
                    roomData={roomData}
                    onClose={() => {
                        setShowPreview(false);
                        setPreviewError(null);
                    }}
                    onPublish={handlePublish}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
}

import {useState, useCallback, useEffect} from "react";
import Toast from "~/components/Layout/AdminLayout/components/Toast";
import RoomSelector from "../RoomSelector";
import RentSectionCard from "../RentSection";
import UtilitySectionCard from "../UtilitySection";
import ExtrasSectionCard from "../ExtrasSection";
import {DiscountSection as DiscountSectionCard, PaymentSection as PaymentSectionCard, NotesSection as NotesSectionCard} from "../DiscountSection";
import SummaryPanel from "../SummaryPanel";
import PreviewModalCard from "../PreviewModal";
import {MOCK_ROOMS} from "~/pages/Admin/Bill/component/data";
import ServicesSection from "~/pages/Admin/Bill/component/ServicesSection";
import styles from "./BillCreator.module.scss";
import { getCreatorBillContext } from "~/service/admin/room";

const pad2 = (n) => String(n).padStart(2, "0");

const shiftDateToMonthYear = (dateStr, month, year) => {
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    const parts = dateStr.split("-").map((p) => Number(p));
    if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return dateStr;
    const [, , day] = parts;
    const lastDay = new Date(year, month, 0).getDate(); // month is 1-based here
    const safeDay = Math.max(1, Math.min(day, lastDay));
    return `${year}-${pad2(month)}-${pad2(safeDay)}`;
};

const SERVICES_CONFIG = {
    wifi: {name: "Internet / WiFi", price: 100000, icon: "📶"},
    parking: {name: "Gửi xe máy", price: 100000, icon: "🛵"},
    cleaning: {name: "Vệ sinh phòng", price: 150000, icon: "🧹"},
    cable: {name: "Truyền hình cáp", price: 80000, icon: "📺"},
    trash: {name: "Phí vệ sinh MT", price: 30000, icon: "🗑️"},
    elevator: {name: "Phí thang máy", price: 50000, icon: "🛗"},
};

const INITIAL = {
    room: null,
    roomId: null,
    contractId: null,
    month: 3,
    year: 2026,
    periodType: "monthly",
    issueDate: "2026-03-07", dueDate: "2026-03-15",
    roomPrice: 3500000, daysInMonth: 31,
    meterReadings: [],
    services: {wifi: true, parking: true, cleaning: false, cable: false, trash: false, elevator: false},
    extras: [], extraNextId: 1,
    discountType: "none", discountVal: 0, discountReason: "",
    lateFee: true,
    paymentMethod: "cash",
    notePublic: "Vui lòng thanh toán trước ngày 15/03/2026. Liên hệ: 0912 000 111. Cảm ơn!",
    noteInternal: "",
    sendZalo: true, sendSms: true, sendEmail: false, sendNow: true,
};

export default function InvoiceCreator() {
    const [state, setState] = useState(INITIAL);
    const [showPreview, setShowPreview] = useState(false);
    const [toast, setToast] = useState(null);

    const patch = useCallback((updates) => setState(prev => ({...prev, ...updates})), []);
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
        setToast({msg, type});
        setTimeout(() => setToast(null), 3500);
    }, []);

    const handleSelectRoom = useCallback((roomNumber, roomData) => {
        // const r = MOCK_ROOMS[id];
        // if (!r || r.status === "empty") return;
        // patch({
        //     room: id, roomPrice: r.rent,
        //     elecPrev: r.elec_prev, elecNew: Math.round(r.elec_prev * 1.035),
        //     waterPrev: r.water_prev, waterNew: Math.round(r.water_prev * 1.015),
        // });
        // if (r.months_left <= 2) showToast(`⚠️ HĐ phòng ${id} còn ${r.months_left} tháng, nhắc gia hạn!`, "warn");
        // }, [patch, showToast]);

        setState(prev => ({
            ...prev,
            room: roomNumber,
            roomId: roomData?.roomId || null,
            // roomPrice: roomData.rent,
            tenantName: roomData?.tenantName || "",
            tenantPhone: roomData?.tenantPhone || "",
            monthsRemaining: roomData?.monthsRemaining || 0,
            contractEndDate: roomData?.contractEndDate || "Vô thời hạn",
        }))
    }, []);

    useEffect(() => {
        const fetchContext = async () => {
            if (!state.roomId || !state.month || !state.year) return;
            const resp = await getCreatorBillContext(state.roomId, state.month, state.year);
            if (!resp || resp.code !== 200 || !resp.result) return;

            const ctx = resp.result;
            const rentPrice = Number(ctx.rentPrice || 0);
            const meterReadings = Array.isArray(ctx.meterReadings) ? ctx.meterReadings : [];

            setState((prev) => ({
                ...prev,
                contractId: ctx.contractId || null,
                roomPrice: rentPrice,
                meterReadings: meterReadings.map((m) => ({
                    utilityId: m.utilityId,
                    utilityName: m.utilityName,
                    unit: m.unit,
                    previousIndex: Number(m.previousIndex || 0),
                    currentIndex: m.currentIndex == null ? "" : String(m.currentIndex),
                    unitPrice: Number(m.unitPrice || 0),
                })),
            }));
        };
        fetchContext();
    }, [state.roomId, state.month, state.year]);

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

    // Computed
    const meterTotal = (state.meterReadings || []).reduce((sum, r) => {
        const prev = Number(r.previousIndex || 0);
        const curr = r.currentIndex === "" || r.currentIndex == null ? null : Number(r.currentIndex);
        const price = Number(r.unitPrice || 0);
        if (curr == null) return sum;
        const diff = curr - prev;
        return sum + Math.max(0, diff * price);
    }, 0);
    const servicesTotal = Object.entries(state.services).filter(([, on]) => on).reduce((s, [k]) => s + SERVICES_CONFIG[k].price, 0);
    const extrasTotal = state.extras.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const subtotal = state.roomPrice + meterTotal + servicesTotal + extrasTotal;
    const discount = state.discountType === "percent"
        ? Math.round(subtotal * state.discountVal / 100)
        : state.discountType === "fixed" ? state.discountVal : 0;
    const total = Math.max(0, subtotal - discount);
    const computed = {meterTotal, servicesTotal, extrasTotal, subtotal, discount, total};

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
                    <ServicesSection state={state} patch={patch}/>
                    <ExtrasSectionCard
                        extras={state.extras}
                        lateFeeEnabled={state.lateFee}
                        onAddExtra={() => patch({
                            extras: [...state.extras, {id: state.extraNextId, name: "", amount: ""}],
                            extraNextId: state.extraNextId + 1,
                        })}
                        onRemoveExtra={(id) => patch({extras: state.extras.filter((e) => e.id !== id)})}
                        onExtraChange={(id, field, val) =>
                            patch({
                                extras: state.extras.map((e) =>
                                    e.id === id ? {...e, [field]: val} : e
                                ),
                            })
                        }
                        onToggleLateFee={() => patch({lateFee: !state.lateFee})}
                    />
                    <DiscountSectionCard
                        discountType={state.discountType}
                        discountVal={state.discountVal}
                        discountReason={state.discountReason}
                        subtotal={subtotal}
                        onTypeChange={(type) => patch({discountType: type})}
                        onValChange={(val) => patch({discountVal: val})}
                        onReasonChange={(val) => patch({discountReason: val})}
                    />
                    <PaymentSectionCard
                        dueDate={state.dueDate}
                        paymentMethod={state.paymentMethod}
                        onDueDateChange={(val) => patch({dueDate: val})}
                        onMethodChange={(val) => patch({paymentMethod: val})}
                    />
                    <NotesSectionCard
                        notePublic={state.notePublic}
                        noteInternal={state.noteInternal}
                        sendZalo={state.sendZalo}
                        sendSms={state.sendSms}
                        sendEmail={state.sendEmail}
                        sendNow={state.sendNow}
                        onNotePublicChange={(val) => patch({notePublic: val})}
                        onNoteInternalChange={(val) => patch({noteInternal: val})}
                        onToggleZalo={() => patch({sendZalo: !state.sendZalo})}
                        onToggleSms={() => patch({sendSms: !state.sendSms})}
                        onToggleEmail={() => patch({sendEmail: !state.sendEmail})}
                        onToggleSendNow={(val) => patch({sendNow: val})}
                    />

                    {/* Bottom actions */}
                    <div style={{display: "flex", gap: 10}}>
                        <button onClick={() => showToast("🗑 Đã huỷ nháp", "warn")}
                                style={{
                                    flex: 1,
                                    padding: "12px 18px",
                                    background: "none",
                                    // border: "1px solid var(--border-mid)",
                                    borderRadius: 3,
                                    color: "var(--text-faint)",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-body)"
                                }}>
                            Huỷ bỏ
                        </button>
                        <button onClick={() => setShowPreview(true)}
                                style={{
                                    flex: 1,
                                    padding: "12px 18px",
                                    background: "none",
                                    border: "1px solid var(--border-cyan)",
                                    borderRadius: 3,
                                    color: "var(--cyan-mid)",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-body)"
                                }}>
                            👁 Xem trước
                        </button>
                        <button onClick={() => showToast("✅ Hoá đơn đã phát hành & gửi Zalo!", "success")}
                                style={{
                                    flex: 2,
                                    padding: "12px 18px",
                                    background: "var(--cyan-dim)",
                                    border: "1px solid var(--cyan)",
                                    borderRadius: 3,
                                    color: "var(--cyan)",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: ".3px",
                                    position: "relative",
                                    overflow: "hidden"
                                }}>
                            ✅ Lưu &amp; Phát hành hoá đơn
                        </button>
                    </div>
                </div>

                {/* SUMMARY PANEL */}
                <SummaryPanel
                    state={state}
                    computed={computed}
                    roomData={MOCK_ROOMS[state.room]}
                    onPublish={() => showToast("✅ Hoá đơn đã phát hành!", "success")}
                    onPreview={() => setShowPreview(true)}
                    onShare={() => showToast("📋 Đã sao chép link chia sẻ!", "info")}
                />
            </div>

            {showPreview && (
                <PreviewModalCard
                    state={state}
                    computed={computed}
                    roomData={MOCK_ROOMS[state.room]}
                    onClose={() => setShowPreview(false)}
                    onPublish={() => {
                        showToast("✅ Hoá đơn đã phát hành!", "success");
                        setShowPreview(false);
                    }}
                    onPrint={() => showToast("🖨 In hoá đơn (mock)", "info")}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type}/>}
        </div>
    );
}

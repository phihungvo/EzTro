import SectionCard from '../SectionCard/SectionCard';
import { Field, InputSuffix, PrefixInput } from '../shared/FormFields';
import sharedStyles from '../shared/FormFields.module.scss';
import { PAYMENT_METHOD_OPTIONS } from '../shared/constants';
import styles from './FinanceSection.module.scss';
import FinanceSummary from "~/pages/Admin/Contract/components/FinanceSummary";
import ServiceTable from "~/pages/Admin/Contract/components/ServiceTable";

export default function FinanceSection({
                                           state, patch,
                                           services, onToggleService, onPatchService, onAddService, onRemoveService,
                                           formatVND,
                                       }) {
    const rentNum      = Number(String(state.rentPrice).replace(/[^0-9]/g, '')) || 0;
    const depositNum   = Number(String(state.deposit).replace(/[^0-9]/g, '')) || rentNum * Number(state.depositMonths || 2);
    const fixedServices = services.filter((s) => s.on && !s.byMeter);
    const fixedTotal    = fixedServices.reduce((acc, s) => acc + s.price * s.qty, 0);
    const monthlyTotal  = rentNum + fixedTotal;
    const signTotal     = depositNum + monthlyTotal;

    return (
        <SectionCard
            icon="💰"
            iconColor="green"
            title="Thông tin tài chính"
            desc="Tiền thuê, đặt cọc, dịch vụ và phương thức thanh toán"
        >
            {/* ── Giá thuê & cọc ── */}
            <div className={sharedStyles.formGrid3}>
                <Field label="Giá thuê hàng tháng" required>
                    <PrefixInput
                        prefix="₫"
                        value={state.rentPrice}
                        onChange={(e) => patch({ rentPrice: e.target.value })}
                        placeholder="3.500.000"
                    />
                </Field>

                <Field label="Tiền đặt cọc" required hint="Thường 1-3 tháng tiền thuê">
                    <PrefixInput
                        prefix="₫"
                        value={state.deposit}
                        onChange={(e) => patch({ deposit: e.target.value })}
                        placeholder="7.000.000"
                    />
                </Field>

                <Field label="Số tháng cọc">
                    <InputSuffix
                        value={state.depositMonths}
                        onChange={(e) => patch({ depositMonths: e.target.value })}
                        suffix="tháng"
                        min={1}
                        max={6}
                    />
                </Field>

                <Field label="Ngày thu tiền hàng tháng" required>
                    <InputSuffix
                        value={state.monthlyPaymentDay}
                        onChange={(e) => patch({ monthlyPaymentDay: e.target.value })}
                        suffix="hàng tháng"
                        min={1}
                        max={28}
                        placeholder="VD: 5"
                    />
                </Field>

                <Field label="Phương thức thanh toán">
                    <select
                        className={sharedStyles.select}
                        value={state.depositPaymentMethod}
                        onChange={(e) => patch({ depositPaymentMethod: e.target.value })}
                    >
                        <option value="">Chọn phương thức</option>
                        {PAYMENT_METHOD_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Ngày nhận cọc">
                    <input
                        className={sharedStyles.input}
                        type="date"
                        value={state.depositReceivedAt}
                        onChange={(e) => patch({ depositReceivedAt: e.target.value })}
                    />
                </Field>
            </div>

            <div className={sharedStyles.sectionDivider} />

            {/* ── Bảng dịch vụ ── */}
            <ServiceTable
                services={services}
                onToggle={onToggleService}
                onPatch={onPatchService}
                onAdd={onAddService}
                onRemove={onRemoveService}
                formatVND={formatVND}
            />

            <div className={sharedStyles.sectionDivider} />

            {/* ── Ghi chú + tóm tắt tài chính ── */}
            <div className={sharedStyles.formGrid2}>
                <Field label="Ghi chú thanh toán">
                    <textarea
                        className={sharedStyles.textarea}
                        defaultValue={'Chuyển khoản: MB Bank\nSTK: 0912345678\nChủ TK: NGUYEN VAN A'}
                    />
                </Field>

                <FinanceSummary
                    rentNum={rentNum}
                    depositNum={depositNum}
                    fixedServices={fixedServices}
                    monthlyTotal={monthlyTotal}
                    signTotal={signTotal}
                    depositMonths={state.depositMonths}
                    formatVND={formatVND}
                />
            </div>
        </SectionCard>
    );
}
import styles from '../FinanceSection/FinanceSection.module.scss';

export default function ServiceTable({
                                         services, onToggle, onPatch, onAdd, onRemove, formatVND, editable = true,
                                     }) {
    return (
        <>
            <div className={styles.serviceTableHeader}>
                <span>Bảng dịch vụ &amp; tiện ích</span>
                {editable ? (
                    <button
                        className={`${styles.btn} ${styles.btnGhost}`}
                        style={{ fontSize: 12, padding: '5px 10px' }}
                        onClick={onAdd}
                    >
                        ＋ Thêm dịch vụ
                    </button>
                ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Chỉnh sửa dịch vụ tại màn dịch vụ/phòng
                    </span>
                )}
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.serviceTable}>
                    <thead>
                    <tr>
                        <th style={{ width: 46 }} />
                        <th>Dịch vụ</th>
                        <th>Đơn vị</th>
                        <th style={{ width: 110 }}>Đơn giá</th>
                        <th style={{ width: 80 }}>Số lượng</th>
                        <th style={{ width: 110, textAlign: 'right' }}>Thành tiền</th>
                        <th style={{ width: 36 }} />
                    </tr>
                    </thead>
                    <tbody>
                    {services.map((svc) => {
                        const amount = svc.on && !svc.byMeter ? Number(svc.price || 0) * Number(svc.qty || 0) : null;
                        return (
                            <tr key={svc.id}>
                                <td className={styles.tdCenter}>
                                    <button
                                        className={`${styles.serviceToggle} ${svc.on ? styles.on : ''}`}
                                        disabled={!editable}
                                        onClick={() => onToggle(svc.id)}
                                    />
                                </td>
                                <td>
                                    <input
                                        className={styles.tableInput}
                                        value={svc.name}
                                        readOnly={!editable}
                                        onChange={(e) => onPatch(svc.id, 'name', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        className={styles.tableSelect}
                                        value={svc.unit}
                                        disabled={!editable}
                                        onChange={(e) => {
                                            const isMeter = e.target.value === 'kWh' || e.target.value === 'm³';
                                            onPatch(svc.id, 'unit', e.target.value);
                                            onPatch(svc.id, 'byMeter', isMeter);
                                        }}
                                    >
                                        <option>kWh</option>
                                        <option>m³</option>
                                        <option>Tháng</option>
                                        <option>Người</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        className={styles.tableInput}
                                        type="number"
                                        value={svc.price}
                                        readOnly={!editable}
                                        onChange={(e) => onPatch(svc.id, 'price', Number(e.target.value))}
                                    />
                                </td>
                                <td>
                                    {svc.byMeter ? (
                                        <input
                                            className={styles.tableInput}
                                            type="number"
                                            value={0}
                                            readOnly
                                            style={{ opacity: 0.4 }}
                                        />
                                    ) : (
                                        <input
                                            className={styles.tableInput}
                                            type="number"
                                            value={svc.qty}
                                            readOnly={!editable}
                                            onChange={(e) => onPatch(svc.id, 'qty', Number(e.target.value))}
                                        />
                                    )}
                                </td>
                                <td
                                    className={styles.tdRight}
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: svc.on && !svc.byMeter
                                            ? 'var(--text-primary)'
                                            : 'var(--text-muted)',
                                    }}
                                >
                                    {svc.byMeter
                                        ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Theo chỉ số</span>
                                        : !svc.on
                                            ? '—'
                                            : formatVND(amount)}
                                </td>
                                <td>
                                    <button
                                        className={styles.btnIcon}
                                        disabled={!editable || svc.isSystem}
                                        onClick={() => onRemove(svc.id)}
                                        title={svc.isSystem ? 'Dịch vụ mặc định của khu trọ' : 'Xóa dịch vụ'}
                                        style={!editable || svc.isSystem ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

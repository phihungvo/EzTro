import React from 'react';
import {BankOutlined, EnvironmentOutlined, HomeOutlined, InfoCircleOutlined, PhoneOutlined, TeamOutlined} from '@ant-design/icons';
import ActionBar from '~/pages/Admin/Contract/components/ActionBar';
import StepsBar from '~/pages/Admin/Contract/components/StepsBar';
import SectionCard from '~/pages/Admin/Contract/components/SectionCard/SectionCard';
import styles from './BoardingHouseCreatorPage.module.scss';
import {useBoardingHouseCreatorPage} from './useBoardingHouseCreatorPage';

export default function BoardingHouseCreatorPage() {
    const {
        state,
        patch,
        ownerOptions,
        initializing,
        submitting,
        activeStep,
        setActiveStep,
        isEditMode,
        isOwner,
        selectedOwnerLabel,
        summaryStats,
        isQuotaExceeded,
        handleSubmit,
        handleReset,
        handleBack,
        steps,
    } = useBoardingHouseCreatorPage();

    if (initializing) {
        return <div className={styles.pageLoading}>Đang tải dữ liệu khu trọ...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.mainContent}>
                <StepsBar
                    steps={steps}
                    activeStep={activeStep}
                    onChange={setActiveStep}
                />

                <div className={styles.contentGrid}>
                    <div className={styles.contentMain}>
                        <SectionCard
                            icon={<BankOutlined/>}
                            iconColor="green"
                            title="Nhận diện khu trọ"
                            desc="Thiết lập tên, vị trí và đầu mối quản lý cho khu trọ."
                        >
                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Tên khu trọ</span>
                                    <input
                                        className={styles.input}
                                        value={state.name}
                                        onChange={(event) => patch({name: event.target.value})}
                                        placeholder="Ví dụ: Khu trọ Minh Anh"
                                    />
                                </label>

                                {!isOwner && (
                                    <label className={styles.field}>
                                        <span className={styles.label}>Chủ sở hữu</span>
                                        <select
                                            className={styles.input}
                                            value={state.ownerId}
                                            onChange={(event) => patch({ownerId: event.target.value})}
                                        >
                                            <option value="">Chọn chủ sở hữu</option>
                                            {ownerOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <label className={`${styles.field} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Địa chỉ</span>
                                    <input
                                        className={styles.input}
                                        value={state.address}
                                        onChange={(event) => patch({address: event.target.value})}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Số điện thoại liên hệ</span>
                                    <input
                                        className={styles.input}
                                        value={state.contactPhone}
                                        onChange={(event) => patch({contactPhone: event.target.value})}
                                        placeholder="0909 000 000"
                                    />
                                </label>
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={<HomeOutlined/>}
                            iconColor="blue"
                            title="Quy mô vận hành"
                            desc="Thiết lập dữ liệu tổng quan để đồng bộ với màn hình danh sách khu trọ."
                        >
                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Tổng số tòa nhà</span>
                                    <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={state.totalBuildings}
                                        onChange={(event) => patch({totalBuildings: event.target.value})}
                                        placeholder="0"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Tổng số phòng</span>
                                    <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={state.totalRooms}
                                        onChange={(event) => patch({totalRooms: event.target.value})}
                                        placeholder="0"
                                    />
                                </label>

                                <label className={`${styles.field} ${styles.fullWidth}`}>
                                    <span className={styles.label}>Mô tả vận hành</span>
                                    <textarea
                                        className={`${styles.input} ${styles.textarea}`}
                                        value={state.description}
                                        onChange={(event) => patch({description: event.target.value})}
                                        placeholder="Ghi chú thêm về khu trọ, quy định riêng hoặc định hướng khai thác"
                                    />
                                </label>
                            </div>
                        </SectionCard>
                    </div>

                    <div className={styles.contentAside}>
                        <SectionCard
                            icon={<InfoCircleOutlined/>}
                            iconColor="gold"
                            title="Tóm tắt cấu hình"
                            desc="Rà soát nhanh trước khi lưu."
                        >
                            <div className={styles.summaryList}>
                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <BankOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Tên khu trọ</div>
                                        <div className={styles.summaryValue}>{state.name || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <EnvironmentOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Địa chỉ</div>
                                        <div className={styles.summaryValue}>{state.address || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <PhoneOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Liên hệ</div>
                                        <div className={styles.summaryValue}>{state.contactPhone || 'Chưa nhập'}</div>
                                    </div>
                                </div>

                                <div className={styles.summaryItem}>
                                    <div className={styles.summaryIconWrap}>
                                        <TeamOutlined/>
                                    </div>
                                    <div>
                                        <div className={styles.summaryLabel}>Chủ sở hữu</div>
                                        <div className={styles.summaryValue}>{selectedOwnerLabel}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statGrid}>
                                {summaryStats.map((item) => (
                                    <div key={item.label} className={styles.statCard}>
                                        <div className={styles.statLabel}>{item.label}</div>
                                        <div className={styles.statValue}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {isQuotaExceeded && (
                                <div className={styles.warningBox}>
                                    Bạn đã dùng hết quota khu trọ hiện tại. Hãy nâng cấp gói trước khi tạo mới.
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>

                <ActionBar
                    onBack={handleBack}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel={isEditMode ? 'Lưu khu trọ' : 'Tạo khu trọ'}
                    submittingLabel={isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                />
            </div>
        </div>
    );
}

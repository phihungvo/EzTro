import React from 'react';
import StepsBar from '~/pages/Admin/Contract/components/StepsBar';
import ActionBar from '~/pages/Admin/Contract/components/ActionBar';
import HeroPanel from './components/HeroPanel';
import IdentitySection from './components/IdentitySection';
import OperationsSection from './components/OperationsSection';
import AmenitiesSection from './components/AmenitiesSection';
import SummarySidebar from './components/SummarySidebar';
import styles from './RoomCreatorPage.module.scss';
import {useRoomCreatorPage} from './useRoomCreatorPage';

export default function RoomCreatorPage() {
    const {
        state,
        patch,
        boardingHouses,
        buildings,
        utilities,
        initializing,
        loadingContext,
        submitting,
        activeStep,
        setActiveStep,
        selectedBoardingHouse,
        selectedBuilding,
        selectedUtilities,
        isEditMode,
        isQuotaExceeded,
        hasActiveContract,
        currentRooms,
        maxRooms,
        handleSubmit,
        handleReset,
        handleBack,
        steps,
    } = useRoomCreatorPage();

    if (initializing) {
        return <div className={styles.pageLoading}>Dang tai du lieu phong...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.mainContent}>
                <HeroPanel
                    isEditMode={isEditMode}
                    selectedBoardingHouse={selectedBoardingHouse}
                    selectedBuilding={selectedBuilding}
                    currentRooms={currentRooms}
                    maxRooms={maxRooms}
                    selectedUtilitiesCount={selectedUtilities.length}
                    hasActiveContract={hasActiveContract}
                    roomNumber={state.roomNumber}
                />

                <StepsBar
                    steps={steps}
                    activeStep={activeStep}
                    onChange={setActiveStep}
                />

                <div className={styles.contentGrid}>
                    <div className={styles.contentMain}>
                        <IdentitySection
                            state={state}
                            patch={patch}
                            boardingHouses={boardingHouses}
                            buildings={buildings}
                            loadingContext={loadingContext}
                            selectedBuilding={selectedBuilding}
                            isEditMode={isEditMode}
                        />

                        <OperationsSection
                            state={state}
                            patch={patch}
                            selectedBuilding={selectedBuilding}
                            statusLocked={hasActiveContract}
                        />

                        <AmenitiesSection
                            state={state}
                            patch={patch}
                            utilities={utilities}
                        />
                    </div>

                    <div className={styles.contentAside}>
                        <SummarySidebar
                            state={state}
                            boardingHouseName={selectedBoardingHouse?.name}
                            buildingName={selectedBuilding?.name}
                            selectedUtilities={selectedUtilities}
                            hasActiveContract={hasActiveContract}
                            selectedBuilding={selectedBuilding}
                            isQuotaExceeded={isQuotaExceeded}
                        />
                    </div>
                </div>

                <ActionBar
                    onBack={handleBack}
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel={isEditMode ? 'Lưu cấu hình phòng' : 'Tạo phòng'}
                    submittingLabel={isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                />
            </div>
        </div>
    );
}

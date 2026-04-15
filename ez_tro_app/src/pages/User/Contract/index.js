import React, {useEffect, useMemo, useState} from "react";
import {Empty, Spin, message, Modal} from "antd";
import styles from "./Contract.module.scss";
import ContractInfoCard from "~/components/Layout/UserLayout/components/ContractInfoCard";
import ContractDocument from "~/components/Layout/UserLayout/components/ContractDocument";
import ContractTerms from "~/components/Layout/UserLayout/components/ContractTerms";
import { getMyCurrentContract } from "~/service/user/my-room";
import {finalizeContractSettlement} from "~/service/admin/contract";

const Contract = () => {
    const [contractData, setContractData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const data = await getMyCurrentContract();
                setContractData(data);
            } catch (error) {
                console.error("Fetch current contract failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, []);

    const contractCardData = useMemo(() => {
        if (!contractData) return null;

        const now = new Date();
        const startDate = contractData.startDate ? new Date(contractData.startDate) : null;
        const endDate = contractData.endDate ? new Date(contractData.endDate) : null;
        let status = "active";

        if (!contractData.isLiving) {
            status = "expired";
        } else if (endDate) {
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 30) {
                status = "expiring_soon";
            }
        }

        return {
            contractId: contractData.contractCode,
            tenantName: contractData.tenantFullName || contractData.fullName || contractData.tenantName || '—',
            landlordName: contractData.landlordFullName || contractData.landlordName || contractData.ownerName || '—',
            roomName: contractData.roomName || contractData.roomNumber || '—',
            floorLabel: contractData.floorNumber != null ? `Tầng ${contractData.floorNumber}` : '—',
            buildingName: contractData.buildingName || '—',
            boardingHouseName: contractData.boardingHouseName || '—',
            boardingHouseAddress: contractData.boardingHouseAddress || 'Chưa cập nhật',
            rentPrice: contractData.rentPrice,
            deposit: contractData.deposit,
            depositMonths: contractData.depositMonths || (contractData.rentPrice && contractData.deposit
                ? Math.max(1, Math.round(contractData.deposit / contractData.rentPrice))
                : 2),
            paymentDay: contractData.paymentDay || contractData.paymentSchedule || 'Ngày 1 hằng tháng',
            electricPrice: contractData.electricPrice || contractData.electricityPrice || 3500,
            waterPrice: contractData.waterPrice || 12000,
            noticeDays: contractData.noticeDays || 30,
            startDate: contractData.startDate ? new Date(contractData.startDate).toLocaleDateString("vi-VN") : "N/A",
            endDate: contractData.endDate ? new Date(contractData.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn",
            status,
            periodLabel: contractData.startDate && contractData.endDate
                ? `${new Date(contractData.startDate).toLocaleDateString("vi-VN")} – ${new Date(contractData.endDate).toLocaleDateString("vi-VN")}`
                : "Đang cập nhật",
            periodMeta: contractData.startDate && contractData.endDate
                ? `(${Math.max(1, Math.ceil((new Date(contractData.endDate).getTime() - new Date(contractData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)))} tháng)`
                : "",
            progressPercent: startDate && endDate
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        Math.round(
                            ((now.getTime() - startDate.getTime()) /
                                Math.max(1, endDate.getTime() - startDate.getTime())) * 100
                        ),
                    ),
                )
                : 0,
            daysPassed: startDate
                ? Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
                : 0,
            daysLeft: endDate
                ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : null,
        };
    }, [contractData]);

    const contractTerms = useMemo(() => {
        if (!contractData) return [];

        const formatCurrency = (value) =>
            value != null
                ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
                : "Chưa cập nhật";

        return [
            {
                title: "Thời Hạn Hợp Đồng:",
                description: `${contractData.startDate ? new Date(contractData.startDate).toLocaleDateString("vi-VN") : "N/A"} đến ${contractData.endDate ? new Date(contractData.endDate).toLocaleDateString("vi-VN") : "vô thời hạn"}`
            },
            {
                title: "Tự Gia Hạn:",
                description: contractData.autoRenew ? "Đang bật" : "Không bật"
            },
            {
                title: "Tiền Thuê:",
                description: `${formatCurrency(contractData.rentPrice)}/tháng`
            },
            {
                title: "Tiền Đặt Cọc:",
                description: `${formatCurrency(contractData.deposit)}`
            },
            {
                title: "Phòng / Tầng:",
                description: `Phòng ${contractData.roomName || "N/A"} · Tầng ${contractData.floorNumber ?? "N/A"}`
            },
            {
                title: "Khu Nhà:",
                description: `${contractData.boardingHouseName || "N/A"} - ${contractData.boardingHouseAddress || "Chưa cập nhật"}`
            },
            {
                title: "Diện tích:",
                description: contractData.area != null ? `${contractData.area} m²` : "Chưa cập nhật"
            }
        ];
    }, [contractData]);

    const handleDownload = () => {
        message.info("Tài liệu hợp đồng chưa được cấu hình tải xuống.");
    };

    const handleRenewRequest = () => {
        Modal.confirm({
            title: 'Yêu cầu gia hạn hợp đồng',
            content: 'Bạn có chắc chắn muốn gửi yêu cầu gia hạn hợp đồng này không? Chủ nhà sẽ xem xét và phản hồi trong thời gian sớm nhất.',
            okText: 'Gửi yêu cầu',
            cancelText: 'Hủy',
            okButtonProps: {danger: true},
            onOk: async () => {
                // await finalizeContractSettlement(contractDetail.id);
                // await loadContractDetail(contractDetail.id);
            },
        });
        // message.info("Tính năng yêu cầu gia hạn đang được phát triển.");
    };

    const handleTerminate = () => {
        message.warning("Vui lòng liên hệ chủ nhà để chấm dứt hợp đồng.");
    };

    const contractHeader = contractData
        ? `Hợp đồng ${contractData.contractCode || 'hiện tại'}`
        : 'Hợp đồng hiện tại';
    const contractSubtitle = contractData
        ? `${contractData.boardingHouseName || '—'} · ${contractData.roomName ? `Phòng ${contractData.roomName}` : 'Đang cập nhật'}`
        : 'Thông tin hợp đồng và điều khoản';

    if (loading) {
        return <div className={styles.contract}><Spin size="large" /></div>;
    }

    if (!contractData || !contractData.isLiving) {
        return (
            <div className={styles.contract}>
                <Empty description="Bạn chưa có hợp đồng hiện tại" />
            </div>
        );
    }

    return (
        <div className={styles.contract}>
            <section className={styles.hero}>
                <div>
                    <div className={styles.heroTitle}>Hợp đồng thuê phòng</div>
                    <div className={styles.heroSub}>{contractHeader} · {contractSubtitle}</div>
                </div>
                <div className={styles.heroBadge}>
                    {contractCardData?.status === 'active'
                        ? 'Đang hiệu lực'
                        : contractCardData?.status === 'expiring_soon'
                            ? 'Sắp hết hạn'
                            : 'Đã hết hạn'}
                </div>
            </section>

            <div className={styles.pageCard}>
                <ContractInfoCard
                    contract={contractCardData}
                    progressPercent={contractCardData?.progressPercent || 0}
                    periodLabel={contractCardData?.periodLabel}
                    periodMeta={contractCardData?.periodMeta}
                    daysPassed={contractCardData?.daysPassed}
                    daysLeft={contractCardData?.daysLeft}
                    onDownload={handleDownload}
                    onRenew={handleRenewRequest}
                    onTerminate={handleTerminate}
                />

                <div className={styles.twoCol}>
                    <ContractDocument
                        fileName={`Hop_Dong_${contractData.contractCode || "Hien_Tai"}.pdf`}
                        onDownload={handleDownload}
                    />

                    <ContractTerms terms={contractTerms} />
                </div>
            </div>
        </div>
    );
};

export default Contract;

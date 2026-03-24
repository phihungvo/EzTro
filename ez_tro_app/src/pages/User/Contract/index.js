import React, { useEffect, useMemo, useState } from "react";
import { Empty, Spin, message } from "antd";
import styles from "./Contract.module.scss";
import ContractInfoCard from "~/components/Layout/UserLayout/components/ContractInfoCard";
import ContractDocument from "~/components/Layout/UserLayout/components/ContractDocument";
import ContractTerms from "~/components/Layout/UserLayout/components/ContractTerms";
import { getMyCurrentContract } from "~/service/user/my-room";

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
            startDate: contractData.startDate ? new Date(contractData.startDate).toLocaleDateString("vi-VN") : "N/A",
            endDate: contractData.endDate ? new Date(contractData.endDate).toLocaleDateString("vi-VN") : "Vô thời hạn",
            status,
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
            {/* Contract Info */}
            <ContractInfoCard contract={contractCardData} />

            {/* Contract Document */}
            <ContractDocument
                fileName={`Hop_Dong_${contractData.contractCode || "Hien_Tai"}.pdf`}
                onDownload={handleDownload}
            />

            {/* Contract Terms */}
            <ContractTerms terms={contractTerms} />
        </div>
    );
};

export default Contract;

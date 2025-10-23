import React from "react";
import { message } from "antd";
import styles from "./Contract.module.scss";
import ContractInfoCard from "~/components/Layout/UserLayout/components/ContractInfoCard";
import ContractDocument from "~/components/Layout/UserLayout/components/ContractDocument";
import ContractTerms from "~/components/Layout/UserLayout/components/ContractTerms";

const Contract = () => {
    // Mock data - replace with API call
    const contractData = {
        contractId: "HD001",
        startDate: "01/01/2024",
        endDate: "01/01/2025",
        status: "active" // active, expired, expiring_soon
    };

    const contractTerms = [
        {
            title: "Thời Hạn Hợp Đồng:",
            description: "12 tháng (từ 01/01/2024 đến 01/01/2025)"
        },
        {
            title: "Tiền Thuê:",
            description: "3.000.000 đ/tháng"
        },
        {
            title: "Tiền Đặt Cọc:",
            description: "3.000.000 đ (hoàn lại khi kết thúc hợp đồng)"
        },
        {
            title: "Quy Định Thanh Toán:",
            description: "Thanh toán trước ngày 5 hằng tháng"
        },
        {
            title: "Điện Nước:",
            description: "Tính theo đồng hồ, thanh toán cuối tháng"
        },
        {
            title: "Trách Nhiệm Bên Thuê:",
            description: "Giữ gìn vệ sinh, không gây ồn ào, báo trước 30 ngày khi muốn kết thúc hợp đồng"
        }
    ];

    const handleDownload = () => {
        message.success("Đang tải xuống hợp đồng...");
        // Implement download logic
        // window.open('/path/to/contract.pdf', '_blank');
    };

    return (
        <div className={styles.contract}>
            {/* Contract Info */}
            <ContractInfoCard contract={contractData} />

            {/* Contract Document */}
            <ContractDocument
                fileName="Hợp_Đồng_Thuê_Phòng_HD001.pdf"
                onDownload={handleDownload}
            />

            {/* Contract Terms */}
            <ContractTerms terms={contractTerms} />
        </div>
    );
};

export default Contract;
import React, { useState } from "react";
import { message } from "antd";
import RoomInfoCard from "~/components/Layout/UserLayout/components/RoomInfoCard";
import IncidentsCard from "~/components/Layout/UserLayout/components/IncidentsCard";
import styles from "./MyRoom.module.scss";

const MyRoom = () => {
    // Mock data - replace with API call
    const roomData = {
        roomNumber: "101",
        building: "Tòa A",
        floor: "1",
        area: "25",
        price: 3000000,
        status: "available" // available, maintenance, empty
    };

    const [incidents] = useState([
        {
            type: "Vòi Nước",
            description: "Vòi nước phòng tắm bị chảy",
            date: "15/11/2024",
            status: "resolved",
            icon: "💧"
        },
        {
            type: "Điện",
            description: "Đèn phòng ngủ không sáng",
            date: "10/11/2024",
            status: "resolved",
            icon: "💡"
        }
    ]);

    const handleReportNew = () => {
        message.info("Mở form báo cáo sự cố mới");
        // Open modal or navigate to report form
    };

    return (
        <div className={styles.myRoom}>
            {/* Room Info */}
            <RoomInfoCard roomData={roomData} />

            {/* Incidents */}
            <IncidentsCard
                incidents={incidents}
                onReportNew={handleReportNew}
            />
        </div>
    );
};

export default MyRoom;
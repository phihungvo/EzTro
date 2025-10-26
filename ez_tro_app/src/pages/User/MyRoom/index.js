import React, { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import RoomInfoCard from "~/components/Layout/UserLayout/components/RoomInfoCard";
import IncidentsCard from "~/components/Layout/UserLayout/components/IncidentsCard";
import styles from "./MyRoom.module.scss";
import { getMyRoomInfo } from "~/service/user/my-room";

const MyRoom = () => {
    const [myRoom, setMyRoom] = useState(null);

    const fetchMyRoom = useCallback(async () => {
        try {
            const response = await getMyRoomInfo();

            if (!response?.result) {
                message.warning("Không thể lấy thông tin phòng của bạn");
                return;
            }

            setMyRoom(response.result);
        } catch (error) {
            console.error("❌ Error fetching room info:", error);
            message.error("Lỗi khi tải dữ liệu phòng");
        }
    }, []);

    useEffect(() => {
        fetchMyRoom();
    }, []); // 👈 Chỉ chạy 1 lần, không để [myRoom] (nếu để sẽ lặp vô hạn)

    const [incidents] = useState([
        {
            type: "Vòi Nước",
            description: "Vòi nước phòng tắm bị chảy",
            date: "15/11/2024",
            status: "resolved",
            icon: "💧",
        },
        {
            type: "Điện",
            description: "Đèn phòng ngủ không sáng",
            date: "10/11/2024",
            status: "resolved",
            icon: "💡",
        },
    ]);

    const handleReportNew = () => {
        message.info("Mở form báo cáo sự cố mới");
    };

    return (
        <div className={styles.myRoom}>
            {/* Room Info */}
            {myRoom ? (
                <RoomInfoCard
                    roomData={{
                        roomNumber: myRoom.roomNumber,
                        building: myRoom.buildingName,
                        floor: myRoom.floor,
                        area: myRoom.area,
                        price: myRoom.rentPrice,
                        status: myRoom.status, // API trả về “Đang ở”
                    }}
                />
            ) : (
                <p>Đang tải thông tin phòng...</p>
            )}

            {/* Incidents */}
            <IncidentsCard
                incidents={incidents}
                onReportNew={handleReportNew}
            />
        </div>
    );
};

export default MyRoom;
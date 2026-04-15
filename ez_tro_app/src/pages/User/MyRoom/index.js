import React, { useCallback, useEffect, useState } from "react";
import { message, Spin } from "antd";
import RoomInfoCard from "~/components/Layout/UserLayout/components/RoomInfoCard";
import IncidentsCard from "~/components/Layout/UserLayout/components/IncidentsCard";
import styles from "./MyRoom.module.scss";
import { getMyRoomInfo } from "~/service/user/my-room";
import {
    getMyIncidentReports,
    createIncidentReports,
    updateIncidentReport,
    deleteIncidentReport
} from "~/service/user/incident-report";

const MyRoom = () => {
    const [myRoom, setMyRoom] = useState(null);
    const [myIncidentReport, setMyIncidentReport] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const fetchIncidentReports = useCallback(async () => {
        try {
            setLoading(true);
            const responseIncident = await getMyIncidentReports();
            setMyIncidentReport(responseIncident || []);
        } catch (error) {
            console.error("❌ Error fetching incident reports:", error);
            message.error("Lỗi khi tải báo cáo sự cố");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRoom();
        fetchIncidentReports();
    }, [fetchMyRoom, fetchIncidentReports]);

    const handleReportNew = async (values) => {
        try {
            await createIncidentReports(values);
            message.success("Tạo báo cáo thành công!");
            await fetchIncidentReports();
        } catch (error) {
            console.error("Error creating report:", error);
            message.error(
                `Lỗi khi tạo báo cáo: ${error.response?.data?.message || error.message}`
            );
            throw error;
        }
    };

    const handleReportEdit = async (id, values) => {
        try {
            await updateIncidentReport(id, values);
            await fetchIncidentReports();
        } catch (error) {
            console.error("Error updating report:", error);
            message.error(
                `Lỗi khi cập nhật báo cáo: ${error.response?.data?.message || error.message}`
            );
            throw error;
        }
    };

    const handleReportDelete = async (id) => {
        try {
            await deleteIncidentReport(id);
            await fetchIncidentReports();
        } catch (error) {
            console.error("Error deleting report:", error);
            message.error(
                `Lỗi khi xóa báo cáo: ${error.response?.data?.message || error.message}`
            );
            throw error;
        }
    };

    const roomTitle = myRoom?.roomNumber ? `Phòng ${myRoom.roomNumber}` : 'Phòng của tôi';
    const roomSubtitle = myRoom
        ? `${myRoom.buildingName || '—'} · Tầng ${myRoom.floor ?? '—'} · ${myRoom.area ? `${myRoom.area} m²` : 'Đang cập nhật'}`
        : 'Thông tin phòng đang được tải';

    return (
        <div className={styles.myRoom}>
            <section className={styles.hero}>
                <div>
                    <div className={styles.heroTitle}>{roomTitle}</div>
                    <div className={styles.heroSub}>{roomSubtitle}</div>
                </div>
                <div className={styles.heroBadge}>{myRoom?.status || 'Đang tải'}</div>
            </section>

            {loading && !myRoom ? (
                <div className={styles.loadingWrap}>
                    <Spin size="large" />
                </div>
            ) : myRoom ? (
                <RoomInfoCard
                    roomData={{
                        roomNumber: myRoom.roomNumber,
                        building: myRoom.buildingName,
                        floor: myRoom.floor,
                        area: myRoom.area,
                        price: myRoom.price,
                        status: myRoom.status,
                    }}
                />
            ) : (
                <div className={styles.emptyState}>Đang tải thông tin phòng...</div>
            )}

            <IncidentsCard
                incidents={myIncidentReport}
                onReportNew={handleReportNew}
                onReportEdit={handleReportEdit}
                onReportDelete={handleReportDelete}
            />
        </div>
    );
};

export default MyRoom;

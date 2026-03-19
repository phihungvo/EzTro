import { useEffect, useState, useCallback } from "react";
import styles from "./RoomSelector.module.scss";
import { message } from "antd";
import { getAllBoardingHousesNoPaged } from "~/service/admin/boarding_house";
import { getAllRoomPeriodSummary } from "~/service/admin/room";

export default function RoomSelector({
                                         selectedRoom,
                                         month,
                                         year,
                                         onSelectRoom,
                                         onMonthChange,
                                         onYearChange,
                                     }) {
    const [boardingHouses, setBoardingHouses] = useState([]);
    const [boardingHouseId, setBoardingHouseId] = useState("");
    const [rooms, setRooms] = useState([]); // dữ liệu từ API
    const [loadingRooms, setLoadingRooms] = useState(false);

    // Fetch danh sách khu nhà trọ khi mount
    useEffect(() => {
        const fetchBoardingHouses = async () => {
            try {
                const data = await getAllBoardingHousesNoPaged();
                setBoardingHouses(data || []);
            } catch (err) {
                console.error("Fetch boarding houses failed", err);
                message.error("Không thể tải danh sách khu nhà trọ");
            }
        };
        fetchBoardingHouses();
    }, []);

    useEffect(() => {
        if (!boardingHouseId && boardingHouses.length > 0) {
            setBoardingHouseId(String(boardingHouses[0].id));
        }
    }, [boardingHouses, boardingHouseId]);

    // Fetch danh sách phòng theo kỳ
    const fetchRoomsByPeriod = useCallback(async () => {
        if (!boardingHouseId || !month || !year) {
            setRooms([]);
            return;
        }

        setLoadingRooms(true);
        try {
            const response = await getAllRoomPeriodSummary(boardingHouseId, month, year);

            // Kiểm tra response an toàn
            if (response && response.code === 200 && Array.isArray(response.result)) {
                setRooms(response.result);

                // Reset nếu phòng đang chọn không còn hợp lệ
                if (selectedRoom && !response.result.some((r) => r.roomNumber === selectedRoom)) {
                    onSelectRoom(null, null);
                }
            } else {
                setRooms([]);
                message.warning("Không có dữ liệu phòng cho kỳ này");
            }
        } catch (err) {
            console.error("Fetch rooms period summary failed", err);
            message.error("Lỗi khi tải danh sách phòng: " + (err.message || "Unknown error"));
            setRooms([]);
        } finally {
            setLoadingRooms(false);
        }
    }, [boardingHouseId, month, year, selectedRoom, onSelectRoom]);

    useEffect(() => {
        fetchRoomsByPeriod();
    }, [fetchRoomsByPeriod]);

    // Badge trạng thái hợp đồng
    const getHistoryBadge = (room) => {
        if (room.monthsRemaining != null && room.monthsRemaining <= 2) {
            return { cls: styles.badgeRed, text: "HĐ sắp HH" };
        }
        return { cls: styles.badgeGreen, text: "Đúng hạn" };
    };

    // Handler chọn phòng từ grid card
    const handleSelectRoomLocal = useCallback((roomNumber) => {
        const selected = rooms.find((r) => r.roomNumber === roomNumber);
        if (selected) {
            onSelectRoom(roomNumber, { ...selected, boardingHouseId: Number(boardingHouseId) }); // truyền lên parent
        } else {
            onSelectRoom(null, null);
        }
    }, [rooms, onSelectRoom, boardingHouseId]);

    // Lấy dữ liệu phòng đang chọn
    const selectedRoomData = rooms.find((r) => r.roomNumber === selectedRoom);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>① Thông tin phòng & hợp đồng</span>
                <span className={styles.chip}>
          Tháng <strong>{month}/{year}</strong>
        </span>
            </div>

            <div className={styles.cardBody}>
                {/* Chọn khu nhà trọ */}
                <div className={styles.fieldGroup} style={{ paddingBottom: 20 }}>
                    <label className={styles.label}>
                        Khu nhà trọ <span className={styles.req}>*</span>
                    </label>
                    <select
                        className={styles.select}
                        value={boardingHouseId}
                        onChange={(e) => setBoardingHouseId(e.target.value)}
                    >
                        <option value="">-- Chọn khu nhà trọ --</option>
                        {boardingHouses.map((bh) => (
                            <option key={bh.id} value={bh.id}>
                                {bh.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tháng / Năm */}
                <div className={styles.row2}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tháng <span className={styles.req}>*</span></label>
                        <select className={styles.select} value={month} onChange={(e) => onMonthChange(+e.target.value)}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Năm <span className={styles.req}>*</span></label>
                        <select className={styles.select} value={year} onChange={(e) => onYearChange(+e.target.value)}>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                </div>

                <div className={styles.sep} />
                <div className={styles.sectionLabel}>Chọn phòng</div>

                {/* Alert nếu phòng đã có hóa đơn */}
                {selectedRoomData?.hasBillThisPeriod && (
                    <div className={styles.alertWarn}>
                        <span>⚠️</span>
                        <span>
              Phòng này đã có hoá đơn tháng <strong>{month}/{year}</strong>. Bạn có muốn tạo hoá đơn bổ sung?
            </span>
                    </div>
                )}

                {/* Loading / Empty / Room Grid */}
                {boardingHouseId && (
                    <>
                        {loadingRooms ? (
                            <div className={styles.loading}>Đang tải danh sách phòng...</div>
                        ) : rooms.length === 0 ? (
                            <div style={{ color: "#999", textAlign: "center", padding: "20px" }}>
                                Không có phòng nào trong khu này cho kỳ {month}/{year}
                            </div>
                        ) : (
                            <>
                                <div className={styles.roomGrid}>
                                    {rooms.map((room) => {
                                        const isSelected = selectedRoom === room.roomNumber;
                                        const isEmpty = room.periodStatus === "Phòng trống" && room.currentOccupants === 0;
                                        const isInvoiced = room.hasBillThisPeriod;

                                        return (
                                            <div
                                                key={room.roomId}
                                                className={`${styles.roomCard} ${isSelected ? styles.selected : ""} ${isEmpty ? styles.empty : ""}`}
                                                onClick={() => !isEmpty && handleSelectRoomLocal(room.roomNumber)}
                                            >
                        <span
                            className={`${styles.statusDot} ${
                                isEmpty ? styles.dotEmpty : isInvoiced ? styles.dotInvoiced : styles.dotAvailable
                            }`}
                        />
                                                <div className={styles.roomNum}>P.{room.roomNumber}</div>
                                                <div className={styles.roomMeta}>
                                                    T{room.floorNumber} · {room.currentOccupants} người
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.dotAvailable}`} />Chưa có HĐ
                  </span>
                                    <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.dotInvoiced}`} />Đã tạo HĐ
                  </span>
                                    <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.dotEmpty}`} />Phòng trống
                  </span>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Tenant card */}
                {selectedRoomData && (
                    <div className={styles.tenantCard}>
                        <div className={styles.tenantAvatar}>👤</div>
                        <div className={styles.tenantInfo}>
                            <div className={styles.tenantNameRow}>
                <span className={styles.tenantName}>
                  {selectedRoomData.tenantName || "Chưa có người thuê"}
                </span>
                                {selectedRoomData.tenantName && (
                                    <span className={styles.badgeCyan}>Đang ở</span>
                                )}
                            </div>
                            <div className={styles.tenantMeta}>
                                {selectedRoomData.tenantPhone && <span>📱 {selectedRoomData.tenantPhone}</span>}
                                {selectedRoomData.contractEndDate && (
                                    <span>
                    📋 HĐ: <strong>{selectedRoomData.contractEndDate}</strong> · Còn{" "}
                                        <strong
                                            className={selectedRoomData.monthsRemaining <= 2 ? styles.textRed : styles.textCyan}
                                        >
                      {selectedRoomData.monthsRemaining != null
                          ? `${selectedRoomData.monthsRemaining} tháng`
                          : "Vô thời hạn"}
                    </strong>
                  </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.tenantRight}>
                            <span className={styles.badgeAmber}>{selectedRoomData.currentOccupants} người</span>
                            <span className={`${getHistoryBadge(selectedRoomData).cls}`}>
                {getHistoryBadge(selectedRoomData).text}
              </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

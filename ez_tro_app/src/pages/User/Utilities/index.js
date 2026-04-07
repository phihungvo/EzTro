import React, {useEffect, useMemo, useState} from "react";
import {Empty, Spin, message} from "antd";
import UtilitiesStats from "~/components/Layout/UserLayout/components/UtilitiesStats";
import UtilitiesTable from "~/components/Layout/UserLayout/components/UtilitiesTable";
import styles from "./Utilities.module.scss";
import {getMyMeterReadingsCurrentPeriod, getMyMeterReadingsHistory} from "~/service/user/utilities";

const Utilities = () => {
    const [loading, setLoading] = useState(true);
    const [currentReadings, setCurrentReadings] = useState([]);
    const [historyReadings, setHistoryReadings] = useState([]);

    useEffect(() => {
        let active = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [current, history] = await Promise.all([
                    getMyMeterReadingsCurrentPeriod(),
                    getMyMeterReadingsHistory(24),
                ]);
                if (!active) return;
                setCurrentReadings(Array.isArray(current) ? current : []);
                setHistoryReadings(Array.isArray(history) ? history : []);
            } catch (error) {
                console.error("Failed to load utilities", error);
                message.error("Không thể tải dữ liệu điện/nước");
                if (active) {
                    setCurrentReadings([]);
                    setHistoryReadings([]);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchData();
        return () => {
            active = false;
        };
    }, []);

    const isElectricReading = (reading) => String(reading?.utilityUnit || "").toLowerCase().includes("kwh");
    const isWaterReading = (reading) => String(reading?.utilityUnit || "").includes("m³")
        || String(reading?.utilityUnit || "").toLowerCase().includes("m3");

    const electricStats = useMemo(() => {
        const readings = currentReadings.filter(isElectricReading);
        const usage = readings.reduce((sum, r) => sum + Number(r?.consumption || 0), 0);
        const cost = readings.reduce((sum, r) => sum + Number(r?.amount || 0), 0);
        return {usage, cost};
    }, [currentReadings]);

    const waterStats = useMemo(() => {
        const readings = currentReadings.filter(isWaterReading);
        const usage = readings.reduce((sum, r) => sum + Number(r?.consumption || 0), 0);
        const cost = readings.reduce((sum, r) => sum + Number(r?.amount || 0), 0);
        return {usage, cost};
    }, [currentReadings]);

    const utilitiesData = useMemo(() => {
        const filtered = historyReadings
            .filter((reading) => isElectricReading(reading) || isWaterReading(reading))
            .slice()
            .sort((a, b) => {
                const byYear = Number(b?.periodYear || 0) - Number(a?.periodYear || 0);
                if (byYear !== 0) return byYear;
                const byMonth = Number(b?.periodMonth || 0) - Number(a?.periodMonth || 0);
                if (byMonth !== 0) return byMonth;
                return Number(b?.id || 0) - Number(a?.id || 0);
            });

        return filtered.map((reading) => {
            const electric = isElectricReading(reading);
            const month = reading?.periodMonth && reading?.periodYear
                ? `${String(reading.periodMonth).padStart(2, "0")}/${reading.periodYear}`
                : "—";
            return {
                type: electric ? "electric" : "water",
                month,
                oldReading: Number(reading?.previousIndex || 0),
                newReading: Number(reading?.currentIndex || 0),
                usage: Number(reading?.consumption || 0),
                unitPrice: Number(reading?.unitPrice || 0),
                total: Number(reading?.amount || 0),
            };
        });
    }, [historyReadings]);

    if (loading) {
        return (
            <div className={styles.utilities}>
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <div className={styles.utilities}>
            {/* Stats Section */}
            <UtilitiesStats
                electricStats={electricStats}
                waterStats={waterStats}
            />

            {/* Table Section */}
            {utilitiesData.length > 0 ? <UtilitiesTable data={utilitiesData} /> : <Empty description="Chưa có dữ liệu điện/nước" />}
        </div>
    );
};

export default Utilities;

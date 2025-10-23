import React, { useState, useEffect } from "react";
import UtilitiesStats from "~/components/Layout/UserLayout/components/UtilitiesStats";
import UtilitiesTable from "~/components/Layout/UserLayout/components/UtilitiesTable";
import styles from "./Utilities.module.scss";

const Utilities = () => {
    const [loading, setLoading] = useState(false);

    // Mock data - replace with API call
    const electricStats = {
        usage: 20,
        cost: 70000
    };

    const waterStats = {
        usage: 5,
        cost: 75000
    };

    const utilitiesData = [
        {
            type: 'electric',
            month: '11/2024',
            oldReading: 100,
            newReading: 120,
            usage: 20,
            unitPrice: 3500,
            total: 70000
        },
        {
            type: 'water',
            month: '11/2024',
            oldReading: 50,
            newReading: 55,
            usage: 5,
            unitPrice: 15000,
            total: 75000
        },
        {
            type: 'electric',
            month: '10/2024',
            oldReading: 80,
            newReading: 100,
            usage: 20,
            unitPrice: 3500,
            total: 70000
        },
        {
            type: 'water',
            month: '10/2024',
            oldReading: 45,
            newReading: 50,
            usage: 5,
            unitPrice: 15000,
            total: 75000
        }
    ];

    useEffect(() => {
        // Load data from API
        // fetchUtilitiesData();
    }, []);

    return (
        <div className={styles.utilities}>
            {/* Stats Section */}
            <UtilitiesStats
                electricStats={electricStats}
                waterStats={waterStats}
            />

            {/* Table Section */}
            <UtilitiesTable data={utilitiesData} />
        </div>
    );
};

export default Utilities;
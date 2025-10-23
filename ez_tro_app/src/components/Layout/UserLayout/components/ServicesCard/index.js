import React from "react";
import { Card } from "antd";
import styles from "./ServicesCard.module.scss";
import ServiceCard from "~/components/Layout/UserLayout/components/ServiceCard";

const ServicesCard = ({ services }) => {
    return (
        <Card
            title={
                <>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>📋</span>
                    Dịch Vụ Tiện Ích
                </>
            }
            className={styles.servicesCard}
        >
            <div className={styles.servicesGrid}>
                {services.map((service, index) => (
                    <ServiceCard
                        key={index}
                        icon={service.icon}
                        label={service.label}
                        onClick={service.onClick}
                    />
                ))}
            </div>
        </Card>
    );
};

export default ServicesCard;
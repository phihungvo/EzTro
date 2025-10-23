import React from "react";
import { Card, Button } from "antd";
import { ToolOutlined } from "@ant-design/icons";
import IncidentItem from "~/components/Layout/UserLayout/components/IncidentItem";
import styles from "./IncidentsCard.module.scss";

const IncidentsCard = ({ incidents, onReportNew }) => {
    return (
        <Card
            title={
                <>
                    <ToolOutlined style={{ marginRight: '8px' }} />
                    Báo Cáo Sự Cố
                </>
            }
            extra={
                <Button type="primary" onClick={onReportNew}>
                    Báo Cáo Mới
                </Button>
            }
            className={styles.incidentsCard}
        >
            <div className={styles.incidentsList}>
                {incidents.length > 0 ? (
                    incidents.map((incident, index) => (
                        <IncidentItem key={index} {...incident} />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🎉</div>
                        <div className={styles.emptyText}>
                            Không có sự cố nào được báo cáo
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default IncidentsCard;
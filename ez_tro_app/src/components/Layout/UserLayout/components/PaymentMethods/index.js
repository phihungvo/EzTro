import React from "react";
import { Card } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import styles from "./PaymentMethods.module.scss";
import PaymentMethodCard from "~/components/Layout/UserLayout/components/PaymentMethodCard";

const PaymentMethods = ({ methods, onSelectMethod }) => {
    return (
        <Card
            title={
                <>
                    <CreditCardOutlined style={{ marginRight: '8px' }} />
                    Phương Thức Thanh Toán
                </>
            }
            className={styles.paymentMethods}
        >
            <div className={styles.methodsGrid}>
                {methods.map((method, index) => (
                    <PaymentMethodCard
                        key={index}
                        icon={method.icon}
                        title={method.title}
                        onClick={() => onSelectMethod(method)}
                    />
                ))}
            </div>
        </Card>
    );
};

export default PaymentMethods;

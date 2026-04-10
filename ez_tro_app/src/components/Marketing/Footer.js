import React from 'react';
import styles from '~/pages/General/Landing/Landing.module.scss';

const LogoIcon = () => (
    <svg viewBox="0 0 20 20">
        <path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z"/>
    </svg>
);

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerGrid}>
                    <div>
                        <div className={styles.footerLogo}>
                            <div className={styles.logoMark}><LogoIcon/></div>
                            EzTro
                        </div>
                        <p className={styles.footerDesc}>Nền tảng SaaS quản lý nhà trọ chuyên nghiệp — đơn giản cho
                            chủ, tiện lợi cho khách. Được tin dùng bởi 3.800+ chủ trọ Việt Nam.</p>
                        <div className={styles.contactBox}>
                            <div>Hotline: <strong>094 809 3448</strong></div>
                            <div>Email: <a href="mailto:info@eztro.vn">info@eztro.vn</a></div>
                            <div>Văn phòng: 328 Nguyễn Thị Minh Khai, Q.3, TP.HCM</div>
                        </div>
                        <div className={styles.socialLinks}>
                            {[
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                                </svg>,
                                <svg viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 12h8M12 8v8"/>
                                </svg>,
                                <svg viewBox="0 0 24 24">
                                    <path
                                        d="M22.5 6.4a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.4a2.8 2.8 0 00-2 2C1.1 8 1.1 12 1.1 12s0 4 .4 5.6a2.8 2.8 0 002 2C5.1 20 12 20 12 20s6.9 0 8.5-.4a2.8 2.8 0 002-2c.4-1.6.4-5.6.4-5.6s0-4-.4-5.6zM9.8 15.5V8.5l6.4 3.5-6.4 3.5z"/>
                                </svg>,
                            ].map((icon, i) => (
                                <a key={i} className={styles.socialLink} href="#">{icon}</a>
                            ))}
                        </div>
                    </div>
                    {[
                        {
                            title: 'Sản phẩm',
                            links: ['Tính năng', 'Bảng giá', 'Changelog', 'Roadmap', 'App iOS & Android']
                        },
                        {
                            title: 'Hỗ trợ',
                            links: ['Hướng dẫn sử dụng', 'FAQ', 'Liên hệ', 'Cộng đồng', 'Trạng thái hệ thống']
                        },
                        {
                            title: 'Công ty',
                            links: ['Về chúng tôi', 'Blog', 'Tuyển dụng', 'Đối tác & API', 'Báo cáo bảo mật']
                        },
                    ].map((col, i) => (
                        <div key={i} className={styles.footerCol}>
                            <h5>{col.title}</h5>
                            <ul>{col.links.map((link, j) => <li key={j}><a href="#">{link}</a></li>)}</ul>
                        </div>
                    ))}
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2025 EzTro JSC. Tất cả quyền được bảo lưu. Mã số thuế: 0312345678</p>
                    <div className={styles.footerBottomLinks}>
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Cookie</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

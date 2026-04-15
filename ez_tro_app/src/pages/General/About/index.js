import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './About.module.scss';
import Header from '~/components/Marketing/Header';
import Footer from '~/components/Marketing/Footer';

const STATS = [
    {label: 'Phòng được quản lý', value: '12,450'},
    {label: 'Chủ trọ tin dùng', value: '3,800+'},
    {label: 'Tỷ lệ hài lòng', value: '98.2%'},
    {label: 'Tỉnh thành phủ sóng', value: '63'},
];

const VALUES = [
    {
        title: 'Minh bạch trước tiên',
        desc: 'Không phí ẩn, không ràng buộc. Quy trình, dữ liệu, giá cả đều rõ ràng để bạn toàn quyền kiểm soát.'
    },
    {
        title: 'Bảo mật cấp doanh nghiệp',
        desc: 'Hạ tầng tại Việt Nam, mã hóa TLS, sao lưu hằng ngày. Tuân thủ Nghị định 13/2023/NĐ-CP về dữ liệu cá nhân.'
    },
    {
        title: 'Thực chiến hiện trường',
        desc: 'Tính năng được xây cùng chủ trọ thật. Chúng tôi liên tục chạy thử tại các dãy phòng ở TP.HCM, Hà Nội, Đà Nẵng.'
    },
    {
        title: 'Khách hàng là bạn đồng hành',
        desc: 'Support 24/7, phản hồi tính năng trong 48 giờ. Chúng tôi chỉ thành công khi bạn vận hành nhẹ nhàng hơn.'
    },
];

const MILESTONES = [
    {year: '2023', title: 'Ra mắt phiên bản beta', detail: 'Xuất phát từ nhu cầu quản lý 12 phòng trọ của chính team founder.'},
    {year: '2024', title: 'Tích hợp thanh toán online', detail: 'VietQR, MoMo, ZaloPay; tự động đối soát giao dịch.'},
    {year: '2025', title: 'Hợp đồng điện tử & mobile app', detail: 'Ký số có giá trị pháp lý, phát hành app iOS & Android.'},
    {year: '2026', title: 'Mở rộng toàn quốc', detail: 'Đội ngũ chăm sóc 3 vùng Bắc - Trung - Nam, uptime 99.9%.'},
];

const TEAM = [
    {name: 'Võ Phi Hùng', role: 'Co-founder · Product', blurb: '10 năm xây sản phẩm SaaS, từng dẫn dắt các dự án fintech.', initials: 'VH'},
    {name: 'Nguyễn Hoài Phương', role: 'Co-founder · Engineering', blurb: 'Kiến trúc hệ thống thanh toán và bảo mật, yêu thích tối ưu trải nghiệm.', initials: 'HP'},
    {name: 'Lê Hải Yến', role: 'Customer Success Lead', blurb: 'Đồng hành hơn 300 chủ trọ, hiểu rõ vận hành tại hiện trường.', initials: 'HY'},
];

const About = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        document.title = 'Về EzTro - Nền tảng quản lý nhà trọ';
    }, []);

    return (
        <div className={styles.aboutPage}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
      `}</style>

            <Header/>

            <header className={styles.hero}>
                <div className={styles.heroBg}/>
                <div className={styles.container}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroCopy}>
                            <p className={styles.sectionEyebrow}>Chúng tôi là EzTro</p>
                            <h1>Giúp chủ trọ vận hành <em>nhẹ nhàng</em> và <span>minh bạch</span> hơn mỗi ngày</h1>
                            <p className={styles.lead}>
                                EzTro sinh ra khi chính đội ngũ chúng tôi phải quản lý hàng chục phòng trọ bằng Excel và sổ tay.
                                Từ bài toán thực tế đó, chúng tôi xây nền tảng SaaS all-in-one để thu tiền tự động, quản lý hợp đồng,
                                nhắc nợ, và chăm sóc người thuê trong một trải nghiệm liền mạch.
                            </p>
                            <div className={styles.heroActions}>
                                <button className={styles.btnPrimary} onClick={() => navigate('/register')}>
                                    Dùng thử miễn phí
                                </button>
                                <button className={styles.btnGhost} onClick={() => navigate('/')}>
                                    Xem landing mới
                                </button>
                            </div>
                            <div className={styles.heroMeta}>
                                <span className={styles.metaBadge}>Ra mắt 2023</span>
                                <span className={styles.metaBadge}>Máy chủ tại Việt Nam</span>
                                <span>Tuân thủ NĐ 13/2023/NĐ-CP · SLA 99.9%</span>
                            </div>
                        </div>

                        <div className={styles.heroPanel}>
                            <div className={styles.panelTitle}>Sứ mệnh</div>
                            <p>Giúp chủ trọ Việt Nam vận hành chuyên nghiệp như một doanh nghiệp, nhưng vẫn gần gũi, thân thiện với người thuê.</p>
                            <ul className={styles.panelList}>
                                <li>⚡ Cắt 70% thời gian thao tác thu tiền, nhắc nợ, xuất hóa đơn.</li>
                                <li>🔒 Bảo vệ dữ liệu cá nhân và giao dịch tài chính an toàn.</li>
                                <li>🤝 Kết nối chủ trọ và người thuê qua trải nghiệm liền mạch, minh bạch.</li>
                            </ul>
                            <div className={styles.panelFooter}>
                                <div>
                                    <div className={styles.panelNumber}>4.9/5</div>
                                    <div className={styles.panelLabel}>Đánh giá trung bình</div>
                                </div>
                                <div>
                                    <div className={styles.panelNumber}>30 ngày</div>
                                    <div className={styles.panelLabel}>Dùng thử miễn phí</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        {STATS.map((s, i) => (
                            <div key={i} className={styles.statCard}>
                                <div className={styles.statValue}>{s.value}</div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.sectionEyebrow}>Hành trình</p>
                            <h2>Đi từ 12 phòng trọ đến <em>nền tảng toàn quốc</em></h2>
                        </div>
                        <p className={styles.sectionLead}>Chúng tôi phát triển bằng cách lắng nghe chủ trọ và người thuê, thử nghiệm tại hiện trường, rồi tinh chỉnh liên tục.</p>
                    </div>
                    <div className={styles.timeline}>
                        {MILESTONES.map((m, i) => (
                            <div key={i} className={styles.milestone}>
                                <div className={styles.milestoneDot}/>
                                <div className={styles.milestoneYear}>{m.year}</div>
                                <div className={styles.milestoneTitle}>{m.title}</div>
                                <p className={styles.milestoneDetail}>{m.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.sectionAlt}>
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.sectionEyebrow}>Giá trị cốt lõi</p>
                            <h2>Những điều chúng tôi <em>không thỏa hiệp</em></h2>
                        </div>
                        <p className={styles.sectionLead}>Từ bảo mật đến hỗ trợ khách hàng, mỗi quyết định sản phẩm đều dựa trên bốn trụ cột này.</p>
                    </div>
                    <div className={styles.valuesGrid}>
                        {VALUES.map((v, i) => (
                            <div key={i} className={styles.valueCard}>
                                <div className={styles.valueBadge}>{`0${i + 1}`}</div>
                                <h3>{v.title}</h3>
                                <p>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.sectionEyebrow}>Đội ngũ</p>
                            <h2>Những người đứng sau <em>EzTro</em></h2>
                        </div>
                        <p className={styles.sectionLead}>Chúng tôi nhỏ gọn, thực chiến và thích làm việc với khách hàng mỗi ngày.</p>
                    </div>
                    <div className={styles.teamGrid}>
                        {TEAM.map((t, i) => (
                            <div key={i} className={styles.teamCard}>
                                <div className={styles.avatar}>{t.initials}</div>
                                <div className={styles.teamMeta}>
                                    <div className={styles.teamName}>{t.name}</div>
                                    <div className={styles.teamRole}>{t.role}</div>
                                </div>
                                <p className={styles.teamBlurb}>{t.blurb}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.quoteSection}>
                <div className={styles.container}>
                    <div className={styles.quoteCard}>
                        <p className={styles.quoteText}>
                            “Chủ trọ không cần thêm một phần mềm phức tạp. Họ cần một trợ lý hiểu vận hành, giúp thu tiền đúng hạn, minh bạch với người thuê, và để họ có thời gian sống nhiều hơn.”
                        </p>
                        <div className={styles.quoteAuthor}>
                            <div className={styles.avatar}>VH</div>
                            <div>
                                <div className={styles.teamName}>Võ Phi Hùng</div>
                                <div className={styles.teamRole}>Co-founder · Product</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.finalCta}>
                <div className={styles.container}>
                    <div className={styles.finalCard}>
                        <div>
                            <p className={styles.sectionEyebrow}>Bắt đầu ngay</p>
                            <h2>Sẵn sàng vận hành <em>nhà trọ nhẹ nhàng</em> hơn?</h2>
                            <p className={styles.sectionLead}>Dùng thử miễn phí 30 ngày, không cần thẻ tín dụng. Chúng tôi sẽ đồng hành onboarding tận tay.</p>
                        </div>
                        <div className={styles.finalActions}>
                            <button className={styles.btnPrimary} onClick={() => navigate('/register')}>Tạo tài khoản</button>
                            <button className={styles.btnGhost} onClick={() => navigate('/')}>Xem bản demo</button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>
        </div>
    );
};

export default About;

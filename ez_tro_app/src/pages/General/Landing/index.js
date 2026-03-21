import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { Carousel, Collapse } from 'antd';
import {
    HomeOutlined,
    ApartmentOutlined,
    FileTextOutlined,
    ThunderboltOutlined,
    SafetyOutlined,
    AuditOutlined,
    RocketOutlined,
    CustomerServiceOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    StarFilled,
    DashboardOutlined,
    TeamOutlined,
    DollarOutlined,
    GiftOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '~/routes/AuthContext';
import styles from './Landing.module.scss';

const cx = classNames.bind(styles);

// Tính năng đầy đủ (tham khảo nTro.vn, khác biệt về mô tả)
const FEATURES = [
    {
        icon: <DashboardOutlined />,
        title: 'Tổng quan thông minh',
        desc: 'Dashboard trực quan với biểu đồ, thống kê thu chi, tỷ lệ lấp đầy phòng theo thời gian thực. Mọi số liệu quan trọng trong tầm mắt.',
    },
    {
        icon: <ApartmentOutlined />,
        title: 'Quản lý nhà & phòng',
        desc: 'Quản lý thông tin các tòa nhà, phân loại theo khu vực, trạng thái phòng chi tiết. Dễ dàng theo dõi phòng trống, đang cho thuê.',
    },
    {
        icon: <TeamOutlined />,
        title: 'Quản lý người thuê',
        desc: 'Lưu trữ thông tin khách thuê, lịch sử thuê, liên hệ. Gắn khách thuê với hợp đồng và hoá đơn để quản lý tập trung.',
    },
    {
        icon: <FileTextOutlined />,
        title: 'Hợp đồng thuê',
        desc: 'Tạo, gia hạn và quản lý hợp đồng thuê. Theo dõi hạn thanh toán, kỳ thanh toán. Lưu trữ an toàn, dễ tra cứu.',
    },
    {
        icon: <AuditOutlined />,
        title: 'Hóa đơn & điện nước',
        desc: 'Tạo và quản lý hóa đơn thanh toán. Ghi chỉ số điện/nước theo kỳ, tính chênh lệch tự động. Minh bạch với khách thuê.',
    },
    {
        icon: <DollarOutlined />,
        title: 'Quản lý tài chính',
        desc: 'Theo dõi thu chi, công nợ, báo cáo tài chính chi tiết theo tháng, quý, năm. Xuất báo cáo khi cần.',
    },
];

// Cách sử dụng (3 bước như nTro)
const STEPS = [
    {
        num: '1',
        title: 'Đăng ký tài khoản',
        desc: 'Tạo tài khoản miễn phí chỉ trong 30 giây. Không cần thông tin phức tạp, đăng nhập bằng Google hoặc email.',
    },
    {
        num: '2',
        title: 'Thêm thông tin nhà trọ',
        desc: 'Nhập thông tin tòa nhà, phòng trọ và người thuê hiện tại. Cấu trúc rõ ràng: nhà trọ → phòng → hợp đồng.',
    },
    {
        num: '3',
        title: 'Bắt đầu quản lý',
        desc: 'Sử dụng dashboard để quản lý thu chi, ghi chỉ số điện nước, tạo hoá đơn và theo dõi báo cáo.',
    },
];

// FAQ (tham khảo nTro.vn, nội dung chi tiết gấp 3)
const FAQ_ITEMS = [
    {
        q: 'Dữ liệu của tôi có an toàn không?',
        a: 'Dữ liệu của bạn được mã hoá theo các tiêu chuẩn bảo mật hiện đại. Chúng tôi cam kết không chia sẻ thông tin cá nhân với bên thứ ba và tuân thủ nghiêm ngặt các quy định về bảo mật. Hệ thống lưu trữ trên server an toàn, có sao lưu định kỳ. Bạn có thể yên tâm khi nhập thông tin nhà trọ, phòng, khách thuê và các giao dịch tài chính.',
    },
    {
        q: 'Tôi có thể sử dụng trên điện thoại không?',
        a: 'Có, EZ TRỌ được thiết kế responsive và hoạt động tốt trên máy tính, điện thoại và tablet. Bạn có thể truy cập từ bất kỳ thiết bị nào có kết nối internet. Giao diện tự động điều chỉnh theo kích thước màn hình, thuận tiện cho việc chốt chỉ số điện nước hoặc kiểm tra thông tin khi di chuyển. Không cần cài đặt thêm app, chỉ cần trình duyệt web.',
    },
    {
        q: 'Có hỗ trợ kỹ thuật không?',
        a: 'Có, chúng tôi có đội ngũ hỗ trợ kỹ thuật sẵn sàng giúp đỡ qua email và hotline. Thời gian hỗ trợ linh hoạt theo nhu cầu người dùng. Khi gặp vấn đề về đăng nhập, tạo hoá đơn, ghi chỉ số hay bất kỳ chức năng nào, bạn có thể liên hệ để được hướng dẫn chi tiết. Chúng tôi cam kết phản hồi nhanh và hỗ trợ tận tình.',
    },
    {
        q: 'Tôi có thể quản lý nhiều nhà trọ không?',
        a: 'Có. Hệ thống được thiết kế theo mô hình nhà trọ/toà nhà → phòng → hợp đồng. Mỗi tài khoản owner có thể tạo và quản lý nhiều nhà trọ khác nhau. Bạn có thể phân loại theo khu vực, theo dõi thu chi riêng từng nhà. Cấu trúc rõ ràng giúp dễ quản lý khi mở rộng quy mô hoặc có nhiều địa điểm cho thuê.',
    },
    {
        q: 'Điện/nước tính như thế nào?',
        a: 'Điện nước được tính theo kỳ: mỗi phòng có chỉ số kỳ trước và kỳ hiện tại. Hệ thống tự động tính chênh lệch (kwh, m³) và nhân với đơn giá để ra số tiền. Bạn có thể cấu hình giá riêng cho điện, nước theo từng nhà trọ hoặc toàn hệ thống. Số liệu minh bạch, khách thuê có thể đối chiếu. Toàn bộ được tổng hợp vào hoá đơn thanh toán hàng tháng theo từng phòng.',
    },
    {
        q: 'Có thể xuất báo cáo không?',
        a: 'Có, hệ thống hỗ trợ xuất báo cáo với nhiều định dạng khác nhau. Bạn có thể xem báo cáo thu chi, doanh thu theo tháng, quý, năm. Các số liệu được thống kê theo phòng, theo nhà trọ. Chức năng xuất báo cáo giúp bạn tổng hợp dữ liệu phục vụ kế toán, báo cáo thuế hoặc phân tích hiệu quả kinh doanh. Các tính năng báo cáo được cập nhật thường xuyên theo phản hồi người dùng.',
    },
];

const FEEDBACKS = [
    {
        name: 'Anh Nguyễn Hà Thái',
        role: 'Chủ nhà trọ tại Hà Nội',
        text: 'Từ khi sử dụng EZ TRỌ, việc quản lý hơn 50 phòng trọ của tôi trở nên dễ dàng hơn rất nhiều. Giao diện đơn giản, dễ sử dụng, không cần đào tạo nhiều. Phần chốt chỉ số điện nước theo kỳ giúp tôi minh bạch với khách thuê, hết tranh cãi về số tiền. Tạo hoá đơn chỉ mất vài phút mỗi tháng thay vì cả ngày như trước. Tôi thực sự hài lòng và giới thiệu cho bạn bè cùng ngành.',
        stars: 5,
    },
    {
        name: 'Chị Trần Thị Bích',
        role: 'Quản lý ký túc xá tại TP.HCM',
        text: 'Hệ thống báo cáo rất chi tiết, giúp tôi theo dõi thu chi một cách chính xác theo từng tháng. Hỗ trợ khách hàng cũng rất tốt khi có thắc mắc. Phần quản lý hợp đồng và hóa đơn tự động tiết kiệm rất nhiều thời gian cho tôi. Dễ đào tạo nhân viên mới vì giao diện rõ ràng, logic. Rất hài lòng với dịch vụ EZ TRỌ, sẽ tiếp tục sử dụng lâu dài.',
        stars: 5,
    },
    {
        name: 'Anh Lê Văn Phú',
        role: 'Chủ căn hộ cho thuê tại Đà Nẵng',
        text: 'Đối chiếu điện nước minh bạch, khách thuê tin tưởng hơn. Trước đây tôi dùng Excel, vừa rối vừa dễ nhầm. Giờ mọi thứ được lưu trữ rõ ràng: chỉ số kỳ trước, kỳ này, chênh lệch và tổng tiền. Tạo hoá đơn trong vài phút, theo dõi công nợ theo phòng rất tiện. Tiết kiệm thời gian đáng kể, tôi có thể tập trung vào việc khác.',
        stars: 5,
    },
];

const CAROUSEL_IMAGES = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop',
];

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const primaryCta = useMemo(() => {
        if (!user) {
            return { label: 'Đăng nhập', onClick: () => navigate('/login') };
        }
        if (user?.role === 'USER') {
            return { label: 'Vào dashboard', onClick: () => navigate('/user/dashboard') };
        }
        return { label: 'Đăng nhập', onClick: () => navigate('/login') };
    }, [navigate, user]);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className={cx('wrap')}>
            <div className={cx('promoBanner')}>
                <GiftOutlined />
                <span>
                    🎉 Trải nghiệm miễn phí — Đăng ký ngay để khám phá đầy đủ tính năng EZ TRỌ
                </span>
                <button type="button" className={cx('promoBtn')} onClick={() => navigate('/register')}>
                    Đăng ký
                </button>
            </div>

            {/* Header */}
            <header className={cx('header')}>
                <div className={cx('headerInner')}>
                    <button type="button" className={cx('brand')} onClick={() => scrollTo('hero')}>
                        <span className={cx('logoDot')} />
                        <span>EZ TRỌ</span>
                    </button>
                    <nav className={cx('nav')}>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('hero')}>
                            <HomeOutlined /> Trang chủ
                        </button>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('features')}>
                            <ApartmentOutlined /> Tính năng
                        </button>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('pricing')}>
                            <RocketOutlined /> Gói dịch vụ
                        </button>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('feedback')}>
                            <CustomerServiceOutlined /> Phản hồi
                        </button>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('faq')}>
                            <QuestionCircleOutlined /> FAQ
                        </button>
                        <button type="button" className={cx('navLink')} onClick={() => scrollTo('steps')}>
                            Cách sử dụng
                        </button>
                    </nav>
                    <div className={cx('headerCta')}>
                        <button type="button" className={cx('btnGhost')} onClick={() => navigate('/register')}>
                            Đăng ký
                        </button>
                        <button type="button" className={cx('btnPrimary')} onClick={() => navigate('/login')}>
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </header>

            <div className={cx('container')}>
                {/* Hero + Image (tham khảo nTro) */}
                <section className={cx('hero')} id="hero">
                    <div className={cx('heroContent')}>
                        <div className={cx('heroTrust')}>✨ Được hàng trăm chủ nhà trọ tin dùng</div>
                        <div className={cx('heroCard')}>
                            <div className={cx('title')}>
                                Quản lý nhà trọ — Dễ dàng & Chuyên nghiệp
                            </div>
                            <div className={cx('titleSub')}>
                                Một nền tảng toàn diện: phòng, hợp đồng, điện nước, hoá đơn — tất cả trong tầm tay
                            </div>
                            <div className={cx('subtitle')}>
                                Tối ưu hoá quy trình vận hành, giảm sai sót, tiết kiệm thời gian. Bắt đầu quản lý chuyên nghiệp ngay hôm nay.
                            </div>
                            <div className={cx('ctaRow')}>
                                <button type="button" className={cx('btnPrimary')} onClick={primaryCta.onClick}>
                                    🚀 Bắt đầu ngay
                                </button>
                                <button type="button" className={cx('btnGhost')} onClick={() => scrollTo('carousel')}>
                                    Xem demo
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={cx('heroImage')}>
                        <div className={cx('heroImgWrap')}>
                            <img
                                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop"
                                alt="Quản lý nhà trọ"
                            />
                            <div className={cx('heroImgOverlay')} />
                        </div>
                    </div>
                </section>

                {/* Carousel Images - Xem demo */}
                <section className={cx('section')} id="carousel">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Giao diện trực quan & dễ sử dụng</div>
                            <div className={cx('sectionSub')}>
                                Dashboard thông minh, bố cục rõ ràng — mọi thao tác chỉ trong vài cú nhấp chuột
                            </div>
                        </div>
                    </div>
                    <div className={cx('carouselWrap')}>
                        <Carousel autoplay effect="fade" className={cx('carousel')}>
                            {CAROUSEL_IMAGES.map((src, i) => (
                                <div key={i} className={cx('carouselSlide')}>
                                    <img src={src} alt={`Slide ${i + 1}`} />
                                    <div className={cx('carouselOverlay')} />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </section>

                {/* Tính năng đầy đủ - 6 mục (tham khảo nTro) */}
                <section className={cx('section')} id="features">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Mọi tính năng bạn cần</div>
                            <div className={cx('sectionSub')}>
                                Từ quản lý phòng, hợp đồng đến hoá đơn — mọi thứ trong một nền tảng thống nhất
                            </div>
                        </div>
                    </div>
                    <div className={cx('featureGrid')}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className={cx('featureItem')}>
                                <div className={cx('featureIcon')}>{f.icon}</div>
                                <div className={cx('featureName')}>{f.title}</div>
                                <div className={cx('featureDesc')}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cách sử dụng - 3 bước (tham khảo nTro) */}
                <section className={cx('section')} id="steps">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Khởi động chỉ trong 3 bước</div>
                            <div className={cx('sectionSub')}>
                                Đơn giản — Bắt đầu quản lý chuyên nghiệp ngay hôm nay
                            </div>
                        </div>
                    </div>
                    <div className={cx('stepsGrid')}>
                        {STEPS.map((s, i) => (
                            <div key={i} className={cx('stepCard')}>
                                <div className={cx('stepNum')}>{s.num}</div>
                                <div className={cx('stepTitle')}>{s.title}</div>
                                <div className={cx('stepDesc')}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits */}
                <section className={cx('section')}>
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Lý do chọn EZ TRỌ</div>
                            <div className={cx('sectionSub')}>
                                Quy trình chuẩn hoá — Dữ liệu minh bạch — Tiết kiệm thời gian mỗi tháng
                            </div>
                        </div>
                    </div>
                    <div className={cx('benefitGrid')}>
                        <div className={cx('benefitCard')}>
                            <span className={cx('badge')}>
                                <SafetyOutlined /> Chuẩn hoá
                            </span>
                            <div className={cx('benefitName')}>Quy trình rõ ràng</div>
                            <div className={cx('benefitDesc')}>
                                Từ phòng → hợp đồng → ghi chỉ số → hoá đơn. Luồng nhất quán giúp chủ trọ ít nhầm lẫn
                                khi vận hành theo tháng.
                            </div>
                        </div>
                        <div className={cx('benefitCard')}>
                            <span className={cx('badge')}>
                                <AuditOutlined /> Minh bạch
                            </span>
                            <div className={cx('benefitName')}>Đối chiếu điện/nước</div>
                            <div className={cx('benefitDesc')}>
                                Lưu chỉ số kỳ trước/kỳ này, tính chênh lệch tự động. Khách thuê dễ kiểm tra, tránh
                                tranh cãi.
                            </div>
                        </div>
                        <div className={cx('benefitCard')}>
                            <span className={cx('badge')}>
                                <RocketOutlined /> Tốc độ
                            </span>
                            <div className={cx('benefitName')}>Tạo hoá đơn nhanh</div>
                            <div className={cx('benefitDesc')}>
                                Các khoản cố định/biến đổi được gom về một nơi. Chốt hoá đơn trong vài phút mỗi tháng.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing (tham khảo nTro - có banner ưu đãi) */}
                <section className={cx('section')} id="pricing">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Gói dịch vụ linh hoạt</div>
                            <div className={cx('sectionSub')}>
                                Phù hợp mọi quy mô — từ vài phòng đến hàng chục nhà trọ
                            </div>
                        </div>
                    </div>
                    <div className={cx('pricingPromo')}>
                        <GiftOutlined />
                        <span>Ưu đãi đặc biệt — Trải nghiệm miễn phí tất cả tính năng. Đăng ký ngay!</span>
                        <button type="button" className={cx('btnPrimary', 'btnSmall')} onClick={() => navigate('/register')}>
                            Đăng ký
                        </button>
                    </div>
                    <div className={cx('pricingGrid')}>
                        <div className={cx('priceCard')}>
                            <div className={cx('priceIcon')}>
                                <RocketOutlined />
                            </div>
                            <div className={cx('priceName')}>Starter</div>
                            <div className={cx('priceVal')}>Phù hợp ít phòng</div>
                            <div className={cx('priceNote')}>
                                Quản lý phòng, khách thuê, hợp đồng và ghi chỉ số cơ bản. Đủ dùng cho 5–10 phòng.
                            </div>
                        </div>
                        <div className={cx('priceCard', 'priceHighlight')}>
                            <div className={cx('priceIcon')}>
                                <ApartmentOutlined />
                            </div>
                            <div className={cx('priceName')}>Standard</div>
                            <div className={cx('priceVal')}>Vận hành ổn định</div>
                            <div className={cx('priceNote')}>
                                Thêm hoá đơn, báo cáo, thống kê. Phù hợp 10–50 phòng.
                            </div>
                        </div>
                        <div className={cx('priceCard')}>
                            <div className={cx('priceIcon')}>
                                <SafetyOutlined />
                            </div>
                            <div className={cx('priceName')}>Pro</div>
                            <div className={cx('priceVal')}>Mở rộng quy mô</div>
                            <div className={cx('priceNote')}>
                                Tối ưu quy trình, phân quyền chi tiết. Dành cho nhiều nhà trọ/toà nhà.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Khách hàng nói gì (tham khảo nTro) */}
                <section className={cx('section')} id="feedback">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Khách hàng chia sẻ</div>
                            <div className={cx('sectionSub')}>
                                Câu chuyện thực tế từ những chủ nhà trọ đang dùng EZ TRỌ mỗi ngày
                            </div>
                        </div>
                    </div>
                    <div className={cx('feedbackWrap')}>
                        <Carousel autoplay dots className={cx('feedbackCarousel')}>
                            {FEEDBACKS.map((f, i) => (
                                <div key={i} className={cx('feedbackCard')}>
                                    <div className={cx('feedbackStars')}>
                                        {Array.from({ length: f.stars }).map((_, j) => (
                                            <StarFilled key={j} />
                                        ))}
                                    </div>
                                    <p className={cx('feedbackText')}>{f.text}</p>
                                    <div className={cx('feedbackMeta')}>
                                        <strong>{f.name}</strong>
                                        <span>{f.role}</span>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </section>

                {/* FAQ (tham khảo nTro - nhiều câu hơn, accordion) */}
                <section className={cx('section')} id="faq">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Câu hỏi thường gặp</div>
                            <div className={cx('sectionSub')}>
                                Những thắc mắc phổ biến về EZ TRỌ
                            </div>
                        </div>
                    </div>
                    <div className={cx('faqWrap')}>
                        <Collapse
                            accordion
                            className={cx('faqCollapse')}
                            items={FAQ_ITEMS.map((item, i) => ({
                                key: i,
                                label: item.q,
                                children: <p className={cx('faqA')}>{item.a}</p>,
                            }))}
                        />
                    </div>
                </section>

                {/* Final CTA */}
                <div className={cx('finalCta')}>
                        <div>
                            <div className={cx('sectionTitle')}>Sẵn sàng bắt đầu hành trình mới?</div>
                        <div className={cx('finalText')}>
                            Tham gia EZ TRỌ — Quản lý chuyên nghiệp, tiết kiệm thời gian, minh bạch tài chính. Đăng nhập để trải nghiệm ngay.
                        </div>
                    </div>
                    <div className={cx('ctaRow')}>
                        <button type="button" className={cx('btnPrimary')} onClick={primaryCta.onClick}>
                            {primaryCta.label}
                        </button>
                        <button type="button" className={cx('btnGhost')} onClick={() => navigate('/login')}>
                            Đi tới đăng nhập
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer (tham khảo nTro: Sản phẩm, Hỗ trợ) */}
            <footer className={cx('footer')}>
                <div className={cx('footerInner')}>
                    <div className={cx('footerCol')}>
                        <div className={cx('footerBrand')}>
                            <span className={cx('logoDot')} />
                            EZ TRỌ
                        </div>
                        <p className={cx('footerDesc')}>
                            Nền tảng quản lý nhà trọ toàn diện — Minh bạch, hiệu quả, dễ sử dụng. Đồng hành cùng sự phát triển của bạn.
                        </p>
                    </div>
                    <div className={cx('footerCol')}>
                        <div className={cx('footerTitle')}>Sản phẩm</div>
                        <button type="button" className={cx('footerLink')} onClick={() => scrollTo('features')}>
                            Tính năng
                        </button>
                        <button type="button" className={cx('footerLink')} onClick={() => scrollTo('pricing')}>
                            Bảng giá
                        </button>
                        <button type="button" className={cx('footerLink')} onClick={() => scrollTo('steps')}>
                            Hướng dẫn
                        </button>
                    </div>
                    <div className={cx('footerCol')}>
                        <div className={cx('footerTitle')}>Hỗ trợ</div>
                        <button type="button" className={cx('footerLink')} onClick={() => scrollTo('faq')}>
                            Câu hỏi thường gặp
                        </button>
                        <button type="button" className={cx('footerLink')} onClick={() => navigate('/login')}>
                            Liên hệ
                        </button>
                        <button type="button" className={cx('footerLink')}>
                            Chính sách bảo mật
                        </button>
                    </div>
                    <div className={cx('footerCol')}>
                        <div className={cx('footerTitle')}>Liên hệ</div>
                        <div className={cx('footerContact')}>
                            <span>
                                <MailOutlined /> support@ez-tro.vn
                            </span>
                            <span>
                                <PhoneOutlined /> 0912 000 000
                            </span>
                            <span>
                                <EnvironmentOutlined /> TP. Hồ Chí Minh
                            </span>
                        </div>
                    </div>
                </div>
                <div className={cx('footerBottom')}>
                    <span>© {new Date().getFullYear()} EZ TRỌ. Tất cả quyền được bảo lưu.</span>
                    <span>Điều khoản sử dụng · Chính sách bảo mật</span>
                </div>
            </footer>
        </div>
    );
}

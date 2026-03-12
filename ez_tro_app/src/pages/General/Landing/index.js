import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/routes/AuthContext';
import styles from './Landing.module.scss';

const cx = classNames.bind(styles);

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

    return (
        <div className={cx('wrap')}>
            <div className={cx('container')}>
                <div className={cx('topbar')}>
                    <div className={cx('brand')}>
                        <span className={cx('logoDot')} />
                        <span>EZ TRỌ</span>
                    </div>

                    <div className={cx('nav')}>
                        <button
                            type="button"
                            className={cx('navLink')}
                            onClick={() => {
                                const el = document.getElementById('features');
                                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            Tính năng
                        </button>
                        <button
                            type="button"
                            className={cx('navLink')}
                            onClick={() => {
                                const el = document.getElementById('pricing');
                                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            Gói dịch vụ
                        </button>
                        <button
                            type="button"
                            className={cx('navLink')}
                            onClick={() => navigate('/login')}
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>

                <div className={cx('hero')}>
                    <div className={cx('heroCard')}>
                        <div className={cx('title')}>
                            Quản lý phòng trọ <span className={cx('titleAccent')}>nhanh</span>,{' '}
                            hoá đơn <span className={cx('titleAccent')}>chuẩn</span>
                        </div>
                        <div className={cx('subtitle')}>
                            Tập trung vào vận hành: phòng, khách thuê, hợp đồng, ghi điện/nước theo kỳ và tạo hoá đơn
                            chỉ trong vài bước.
                        </div>

                        <div className={cx('ctaRow')}>
                            <button type="button" className={cx('btnPrimary')} onClick={primaryCta.onClick}>
                                {primaryCta.label}
                            </button>
                            <button
                                type="button"
                                className={cx('btnGhost')}
                                onClick={() => {
                                    const el = document.getElementById('features');
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            >
                                Xem tính năng
                            </button>
                        </div>
                    </div>

                    <div className={cx('heroAside')}>
                        <div className={cx('features')} id="features">
                            <div className={cx('featuresTitle')}>Tính năng chính</div>
                            <div className={cx('featureGrid')}>
                                <div className={cx('featureItem')}>
                                    <div className={cx('featureName')}>Phòng &amp; khách thuê</div>
                                    <div className={cx('featureDesc')}>
                                        Quản lý danh sách phòng, trạng thái thuê và thông tin khách thuê rõ ràng.
                                    </div>
                                </div>
                                <div className={cx('featureItem')}>
                                    <div className={cx('featureName')}>Hợp đồng</div>
                                    <div className={cx('featureDesc')}>
                                        Theo dõi hợp đồng active, kỳ thanh toán, hạn thanh toán và các ràng buộc.
                                    </div>
                                </div>
                                <div className={cx('featureItem')}>
                                    <div className={cx('featureName')}>Điện / nước theo kỳ</div>
                                    <div className={cx('featureDesc')}>
                                        Ghi chỉ số, đối chiếu chênh lệch, và tổng hợp chi phí theo phòng.
                                    </div>
                                </div>
                                <div className={cx('featureItem')}>
                                    <div className={cx('featureName')}>Hoá đơn</div>
                                    <div className={cx('featureDesc')}>
                                        Tạo hoá đơn, theo dõi trạng thái thanh toán, và tổng hợp doanh thu.
                                    </div>
                                </div>
                            </div>

                            <div className={cx('how')}>
                                <div className={cx('featuresTitle')}>Cách dùng</div>
                                <div className={cx('steps')}>
                                    <div className={cx('step')}>
                                        <span className={cx('stepDot')} />
                                        <div className={cx('stepText')}>Tạo nhà trọ/toà nhà và danh sách phòng.</div>
                                    </div>
                                    <div className={cx('step')}>
                                        <span className={cx('stepDot')} />
                                        <div className={cx('stepText')}>Thêm khách thuê và tạo hợp đồng.</div>
                                    </div>
                                    <div className={cx('step')}>
                                        <span className={cx('stepDot')} />
                                        <div className={cx('stepText')}>Ghi chỉ số điện/nước theo kỳ.</div>
                                    </div>
                                    <div className={cx('step')}>
                                        <span className={cx('stepDot')} />
                                        <div className={cx('stepText')}>Lập hoá đơn và theo dõi thanh toán.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('stats')}>
                            <div className={cx('featuresTitle')}>Tổng quan nhanh</div>
                            <div className={cx('statsGrid')}>
                                <div className={cx('statCard')}>
                                    <div className={cx('statVal')}>Phòng</div>
                                    <div className={cx('statLabel')}>Theo dõi trạng thái thuê &amp; hợp đồng</div>
                                </div>
                                <div className={cx('statCard')}>
                                    <div className={cx('statVal')}>Chỉ số</div>
                                    <div className={cx('statLabel')}>Điện/nước theo kỳ, đối chiếu minh bạch</div>
                                </div>
                                <div className={cx('statCard')}>
                                    <div className={cx('statVal')}>Hoá đơn</div>
                                    <div className={cx('statLabel')}>Lập hoá đơn nhanh, tổng hợp doanh thu</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('section')}>
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Vì sao EZ TRỌ phù hợp?</div>
                            <div className={cx('sectionSub')}>
                                Tối ưu cho vận hành nhà trọ: ít thao tác, rõ dữ liệu, giảm sai sót khi chốt chỉ số và
                                lập hoá đơn.
                            </div>
                        </div>
                    </div>
                    <div className={cx('benefitGrid')}>
                        <div className={cx('benefitCard')}>
                            <div className={cx('benefitTop')}>
                                <span className={cx('badge')}>Chuẩn hoá</span>
                                <div className={cx('benefitName')}>Quy trình rõ ràng</div>
                            </div>
                            <div className={cx('benefitDesc')}>
                                Từ phòng → hợp đồng → ghi chỉ số → hoá đơn. Luồng nhất quán giúp chủ trọ ít nhầm lẫn khi
                                vận hành theo tháng.
                            </div>
                        </div>
                        <div className={cx('benefitCard')}>
                            <div className={cx('benefitTop')}>
                                <span className={cx('badge')}>Minh bạch</span>
                                <div className={cx('benefitName')}>Đối chiếu điện/nước</div>
                            </div>
                            <div className={cx('benefitDesc')}>
                                Lưu chỉ số kỳ trước/kỳ này, tính chênh lệch, tránh tranh cãi và dễ kiểm tra lại lịch sử.
                            </div>
                        </div>
                        <div className={cx('benefitCard')}>
                            <div className={cx('benefitTop')}>
                                <span className={cx('badge')}>Tốc độ</span>
                                <div className={cx('benefitName')}>Tạo hoá đơn nhanh</div>
                            </div>
                            <div className={cx('benefitDesc')}>
                                Tập trung phần cần nhập. Các khoản cố định/biến đổi được gom về một nơi để chốt hoá đơn
                                trong vài phút.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('section')}>
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Xem trước giao diện</div>
                            <div className={cx('sectionSub')}>
                                Bố cục tối ưu cho dashboard, bảng dữ liệu và các thao tác thường dùng.
                            </div>
                        </div>
                    </div>
                    <div className={cx('showcase')}>
                        <div className={cx('mockWindow')}>
                            <div className={cx('mockBar')}>
                                <span className={cx('dot')} />
                                <span className={cx('dot')} />
                                <span className={cx('dot')} />
                            </div>
                            <div className={cx('mockBody')}>
                                <div className={cx('mockPanel')}>
                                    <div className={cx('mockRow', 'mockRowStrong')} />
                                    <div className={cx('mockRow')} />
                                    <div className={cx('mockRow')} />
                                    <div className={cx('mockRow')} />
                                    <div className={cx('mockRow')} />
                                </div>
                                <div className={cx('mockPanel')}>
                                    <div className={cx('mockRow')} />
                                    <div className={cx('mockRow', 'mockRowStrong')} />
                                    <div className={cx('mockRow')} />
                                    <div className={cx('mockRow')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('section')} id="pricing">
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Gói dịch vụ</div>
                            <div className={cx('sectionSub')}>
                                Có thể bắt đầu từ nhu cầu cơ bản và nâng cấp khi quy mô phòng tăng. (Nội dung gói có thể
                                điều chỉnh theo cấu hình hệ thống.)
                            </div>
                        </div>
                    </div>
                    <div className={cx('pricingGrid')}>
                        <div className={cx('priceCard')}>
                            <div className={cx('priceName')}>Starter</div>
                            <div className={cx('priceVal')}>Phù hợp ít phòng</div>
                            <div className={cx('priceNote')}>Quản lý phòng, khách thuê, hợp đồng và ghi chỉ số cơ bản.</div>
                        </div>
                        <div className={cx('priceCard')}>
                            <div className={cx('priceName')}>Standard</div>
                            <div className={cx('priceVal')}>Vận hành ổn định</div>
                            <div className={cx('priceNote')}>Thêm hoá đơn, báo cáo, và các tính năng theo dõi chi tiết hơn.</div>
                        </div>
                        <div className={cx('priceCard')}>
                            <div className={cx('priceName')}>Pro</div>
                            <div className={cx('priceVal')}>Mở rộng quy mô</div>
                            <div className={cx('priceNote')}>Tối ưu quy trình, giới hạn tài nguyên theo gói và phân quyền.</div>
                        </div>
                    </div>
                </div>

                <div className={cx('section')}>
                    <div className={cx('sectionHead')}>
                        <div>
                            <div className={cx('sectionTitle')}>Câu hỏi thường gặp</div>
                            <div className={cx('sectionSub')}>
                                Một vài câu hỏi phổ biến khi bắt đầu dùng để quản lý nhà trọ.
                            </div>
                        </div>
                    </div>
                    <div className={cx('faqGrid')}>
                        <div className={cx('faqItem')}>
                            <div className={cx('faqQ')}>Tôi có thể quản lý nhiều nhà trọ không?</div>
                            <div className={cx('faqA')}>
                                Có. Hệ thống được thiết kế theo mô hình nhà trọ/toà nhà → phòng → hợp đồng.
                            </div>
                        </div>
                        <div className={cx('faqItem')}>
                            <div className={cx('faqQ')}>Điện/nước tính như thế nào?</div>
                            <div className={cx('faqA')}>
                                Theo kỳ: lưu chỉ số cũ/mới, tự tính chênh lệch và tổng hợp vào hoá đơn theo phòng.
                            </div>
                        </div>
                        <div className={cx('faqItem')}>
                            <div className={cx('faqQ')}>Tôi có thể theo dõi hoá đơn theo tháng không?</div>
                            <div className={cx('faqA')}>
                                Có. Hoá đơn gắn theo phòng/hợp đồng và hỗ trợ lọc theo kỳ để theo dõi doanh thu.
                            </div>
                        </div>
                        <div className={cx('faqItem')}>
                            <div className={cx('faqQ')}>USER (khách thuê) thấy được gì?</div>
                            <div className={cx('faqA')}>
                                USER truy cập dashboard của họ để xem thông tin liên quan và các mục được cấp quyền.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('finalCta')}>
                    <div>
                        <div className={cx('sectionTitle')}>Sẵn sàng bắt đầu?</div>
                        <div className={cx('finalText')}>
                            Đăng nhập để trải nghiệm luồng quản lý phòng, hợp đồng, chốt chỉ số và lập hoá đơn. Admin/Owner
                            sẽ được đưa thẳng về dashboard theo role.
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

                <div className={cx('footer')}>
                    <div>© {new Date().getFullYear()} EZ TRỌ</div>
                    <div className={cx('footerLinks')}>
                        <button
                            type="button"
                            className={cx('footerLink')}
                            onClick={() => window.open('mailto:support@ez-tro.local')}
                        >
                            Hỗ trợ
                        </button>
                        <button type="button" className={cx('footerLink')} onClick={() => navigate('/login')}>
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


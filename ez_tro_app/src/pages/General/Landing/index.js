import React, {useState, useEffect, useRef} from 'react';
import styles from './Landing.module.scss';
import {useLocation} from "react-router-dom";
import Header from '~/components/Marketing/Header';
import Footer from '~/components/Marketing/Footer';

// ── DATA ──
const STATS_TICKER = [
    {num: '12,450', label: 'Phòng đang quản lý'},
    {num: '3,800+', label: 'Chủ trọ tin dùng'},
    {num: '98.2%', label: 'Hài lòng dịch vụ'},
    {num: '47 tỷ+', label: 'Tiền thuê đã xử lý'},
    {num: '63 tỉnh', label: 'Trên toàn quốc'},
    {num: '4.9/5', label: 'Điểm đánh giá'},
];

const FEATURES = [
    {
        icon: '🏠',
        color: 'Green',
        group: 'owner',
        title: 'Quản lý phòng trọ',
        desc: 'Theo dõi trạng thái từng phòng theo thời gian thực: trống, đang thuê, sắp hết hạn. Thêm ảnh, tiện nghi, giá thuê linh hoạt theo từng phòng.'
    },
    {
        icon: '👥',
        color: 'Blue',
        group: 'owner',
        title: 'Hồ sơ người thuê',
        desc: 'Lưu trữ đầy đủ CCCD, ảnh chân dung, hộ khẩu, số điện thoại. Tìm kiếm toàn văn bản, lọc nhanh theo trạng thái thanh toán, khu vực.'
    },
    {
        icon: '💰',
        color: 'Amber',
        group: 'owner',
        title: 'Thu tiền tự động',
        desc: 'Hệ thống tự động tính điện, nước, phí dịch vụ dựa trên chỉ số nhập hoặc đồng hồ thông minh. Nhắc nhở qua Zalo, SMS, Email đúng hạn.'
    },
    {
        icon: '📄',
        color: 'Purple',
        group: 'owner',
        title: 'Hợp đồng điện tử',
        desc: 'Tạo hợp đồng từ template, ký điện tử có giá trị pháp lý, lưu trữ cloud. Tự động nhắc gia hạn trước 30/15/7 ngày. Xuất PDF in ngay.'
    },
    {
        icon: '🔧',
        color: 'Coral',
        group: 'both',
        title: 'Yêu cầu sửa chữa',
        desc: 'Người thuê báo hỏng qua app, đính kèm ảnh. Chủ trọ nhận thông báo, phân công thợ, cập nhật tiến độ. Đóng ticket khi hoàn thành.'
    },
    {
        icon: '📊',
        color: 'Teal',
        group: 'owner',
        title: 'Báo cáo & Phân tích',
        desc: 'Dashboard thống kê doanh thu, công suất, xu hướng theo tháng/quý/năm. Xuất báo cáo Excel, PDF. So sánh hiệu suất giữa các cơ sở.'
    },
];

const OWNER_FEATURES = [
    {
        icon: '🏠',
        title: 'Quản lý nhiều nhà trọ & dãy phòng',
        desc: 'Tổng quan tất cả bất động sản trong một màn hình. Lọc theo địa chỉ, trạng thái, doanh thu.'
    },
    {
        icon: '💬',
        title: 'Nhắc nợ tự động qua Zalo/SMS',
        desc: 'Cài lịch nhắc nhở 1 lần, hệ thống tự gửi thông báo tới từng người thuê đúng ngày đáo hạn.'
    },
    {
        icon: '⚡',
        title: 'Tính tiền điện/nước tự động',
        desc: 'Nhập chỉ số hoặc kết nối đồng hồ thông minh, phần mềm tự tính và tạo hóa đơn chi tiết cho từng phòng.'
    },
    {
        icon: '📑',
        title: 'Quản lý hợp đồng & pháp lý',
        desc: 'Tạo, ký điện tử, gia hạn hoặc chấm dứt hợp đồng. Kho lưu trữ cloud có bảo mật cao, tìm kiếm nhanh.'
    },
    {
        icon: '👨‍💼',
        title: 'Phân quyền nhân viên quản lý',
        desc: 'Thêm người quản lý phụ với quyền hạn riêng biệt. Ghi log đầy đủ mọi thao tác cho từng tài khoản.'
    },
    {
        icon: '💳',
        title: 'Nhận thanh toán online',
        desc: 'Tích hợp QR VietQR, MoMo, ZaloPay, chuyển khoản ngân hàng. Đối soát tự động, không bỏ sót giao dịch.'
    },
];

const TENANT_FEATURES = [
    {
        icon: '📱',
        title: 'Xem hóa đơn hàng tháng rõ ràng',
        desc: 'Hóa đơn chi tiết: tiền phòng, điện, nước, phí dịch vụ. Lịch sử thanh toán đầy đủ từ ngày đầu thuê.'
    },
    {
        icon: '💸',
        title: 'Thanh toán tiền thuê online',
        desc: 'Quét QR hoặc chọn ví điện tử MoMo, ZaloPay, chuyển khoản. Xác nhận tức thì, không cần nhắn tin chủ trọ.'
    },
    {
        icon: '🔧',
        title: 'Báo hỏng, yêu cầu sửa chữa',
        desc: 'Gửi yêu cầu kèm ảnh mô tả sự cố, theo dõi trạng thái xử lý theo thời gian thực, đánh giá sau khi hoàn thành.'
    },
    {
        icon: '📄',
        title: 'Xem & tải hợp đồng thuê phòng',
        desc: 'Hợp đồng lưu trữ trực tuyến, tải PDF bất cứ lúc nào. Nhận thông báo 30 ngày trước khi hợp đồng hết hạn.'
    },
    {
        icon: '🔔',
        title: 'Nhận thông báo đúng lúc',
        desc: 'Nhắc đóng tiền trước 3-5 ngày, thông báo chỉ số điện nước mới, cập nhật tiến độ sửa chữa từ chủ trọ.'
    },
    {
        icon: '💬',
        title: 'Nhắn tin trực tiếp với chủ trọ',
        desc: 'Chat nội bộ trong app, đính kèm ảnh, không phải dùng Zalo cá nhân. Lưu lịch sử trao đổi đầy đủ.'
    },
];

const TABLE_DATA = [
    {
        room: 'P.101',
        avatar: 'VN',
        avatarClass: '1',
        name: 'Nguyễn Văn An',
        phone: '0901 234 567',
        price: '3.500.000đ',
        status: 'Đã trả',
        statusClass: 'Green',
        monthly: '3.850.000đ',
        contract: '31/12/2025',
        dotClass: 'Green',
        dotPulse: true,
        action: 'detail'
    },
    {
        room: 'P.102',
        avatar: 'TB',
        avatarClass: '2',
        name: 'Trần Thị Bích',
        phone: '0912 345 678',
        price: '3.500.000đ',
        status: 'Đã trả',
        statusClass: 'Green',
        monthly: '4.100.000đ',
        contract: '15/06/2025',
        dotClass: 'Green',
        dotPulse: true,
        action: 'detail'
    },
    {
        room: 'P.103',
        avatar: 'LK',
        avatarClass: '3',
        name: 'Lê Minh Khoa',
        phone: '0923 456 789',
        price: '4.000.000đ',
        status: 'Chưa trả',
        statusClass: 'Amber',
        monthly: '4.350.000đ',
        contract: '30/04/2025',
        dotClass: 'Amber',
        dotPulse: false,
        action: 'remind'
    },
    {
        room: 'P.201',
        avatar: 'PL',
        avatarClass: '4',
        name: 'Phạm Thị Lan',
        phone: '0934 567 890',
        price: '3.800.000đ',
        status: 'Đã trả',
        statusClass: 'Green',
        monthly: '4.200.000đ',
        contract: '20/11/2025',
        dotClass: 'Green',
        dotPulse: true,
        action: 'detail'
    },
    {
        room: 'P.202',
        avatar: 'HH',
        avatarClass: '5',
        name: 'Hoàng Văn Hải',
        phone: '0945 678 901',
        price: '3.800.000đ',
        status: 'Chưa trả',
        statusClass: 'Amber',
        monthly: '3.800.000đ',
        contract: '05/09/2025',
        dotClass: 'Amber',
        dotPulse: false,
        action: 'remind'
    },
    {
        room: 'P.203',
        avatar: null,
        avatarClass: null,
        name: 'Chưa có người thuê',
        phone: '',
        price: '4.000.000đ',
        status: 'Trống',
        statusClass: 'Gray',
        monthly: '—',
        contract: '—',
        dotClass: 'Red',
        dotPulse: false,
        action: 'post'
    },
];

const TESTIMONIALS = [
    {
        stars: '★★★★★',
        text: 'Trước mình ghi chép tiền thuê trên Excel, mỗi tháng mất cả ngày để tổng hợp. Từ khi dùng EzTro, hóa đơn tự ra, khách tự chuyển khoản — rảnh rang hẳn! Giờ mình chỉ check app 5 phút mỗi ngày là xong.',
        name: 'Anh Tuấn Hùng',
        role: 'Chủ 18 phòng · Bình Dương',
        av: 'TH',
        avBg: '#E1F5EE',
        avColor: '#065f46'
    },
    {
        stars: '★★★★★',
        text: 'Tính năng nhắc nợ qua Zalo là tuyệt vời nhất. Không còn phải gõ tin nhắn từng người nữa. Từ khi dùng EzTro, tỷ lệ khách trả đúng hạn tăng từ 60% lên hơn 90%. Tiết kiệm rất nhiều thời gian!',
        name: 'Chị Minh Lan',
        role: 'Chủ 32 phòng · TP.HCM',
        av: 'ML',
        avBg: '#EFF6FF',
        avColor: '#1d4ed8'
    },
    {
        stars: '★★★★★',
        text: 'Mình là người thuê trọ, dùng app của EzTro thấy rất tiện. Xem hóa đơn, chuyển tiền, báo hỏng vòi nước — tất cả trong một chỗ. Chủ trọ xử lý yêu cầu rất nhanh kể từ khi dùng hệ thống này.',
        name: 'Bạn Nam Khánh',
        role: 'Người thuê trọ · Hà Nội',
        av: 'NK',
        avBg: '#FEF3C7',
        avColor: '#92400e'
    },
    {
        stars: '★★★★★',
        text: 'Báo cáo tài chính cuối tháng rất trực quan. Mình biết ngay phòng nào đang lãi nhất, tháng nào doanh thu cao nhất. Rất hữu ích cho quyết định đầu tư thêm phòng hay mở thêm cơ sở mới.',
        name: 'Anh Phúc Đạt',
        role: 'Chuỗi 5 nhà trọ · Đà Nẵng',
        av: 'PD',
        avBg: '#F5F3FF',
        avColor: '#5b21b6'
    },
    {
        stars: '★★★★★',
        text: 'Hợp đồng điện tử tiện cực kỳ! Thuê nhà lần đầu nhưng mọi thứ rõ ràng, minh bạch. Hợp đồng lưu trên app, muốn xem lúc nào cũng được. Cảm giác chuyên nghiệp hơn hẳn so với các trọ khác.',
        name: 'Bạn Thúy Uyên',
        role: 'Người thuê trọ · TP.HCM',
        av: 'TU',
        avBg: '#FFF1F2',
        avColor: '#9f1239'
    },
    {
        stars: '★★★★★',
        text: 'Trước tôi dùng phần mềm khác rất phức tạp, phải học cả tuần. EzTro thì dùng được ngay từ ngày đầu. Giao diện thân thiện, support nhiệt tình. Giờ tôi giới thiệu cho tất cả bạn bè cùng làm nghề.',
        name: 'Anh Quang Nghĩa',
        role: 'Chủ 8 phòng · Cần Thơ',
        av: 'QN',
        avBg: '#ECFDF5',
        avColor: '#064e3b'
    },
];

const FAQS = [
    {
        q: 'EzTro có phù hợp với nhà trọ nhỏ (dưới 10 phòng) không?',
        a: 'Hoàn toàn phù hợp! Gói miễn phí hỗ trợ đến 5 phòng không giới hạn thời gian. Gói Pro (299.000đ/tháng) hỗ trợ không giới hạn phòng, rất kinh tế ngay cả với nhà trọ nhỏ khi so sánh lợi ích tiết kiệm thời gian mỗi tháng.'
    },
    {
        q: 'Dữ liệu của tôi có được bảo mật không?',
        a: 'Dữ liệu được mã hóa SSL/TLS, lưu trữ trên máy chủ tại Việt Nam, sao lưu tự động mỗi ngày. Chúng tôi tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Bạn có toàn quyền xuất và xóa dữ liệu bất cứ lúc nào.'
    },
    {
        q: 'Có thể dùng trên điện thoại không?',
        a: 'Có! EzTro có app iOS và Android cho cả chủ trọ và người thuê. Giao diện web cũng responsive hoàn toàn trên mobile. Người thuê chỉ cần tải app là có thể xem hóa đơn và thanh toán ngay.'
    },
    {
        q: 'Tích hợp thanh toán như thế nào? Phí bao nhiêu?',
        a: 'EzTro hỗ trợ VietQR (miễn phí), MoMo, ZaloPay, và tất cả ngân hàng nội địa. Phí giao dịch theo chính sách của từng cổng thanh toán (thường 0% - 1%). EzTro không thu thêm phí xử lý thanh toán.'
    },
    {
        q: 'Hợp đồng điện tử có giá trị pháp lý không?',
        a: 'Có! Hợp đồng điện tử trên EzTro tuân thủ Luật Giao dịch điện tử 2023, có chữ ký điện tử xác thực. Hợp đồng được lưu trữ có timestamp, đảm bảo giá trị pháp lý tương đương hợp đồng giấy.'
    },
    {
        q: 'Nếu muốn hủy gói, dữ liệu có bị mất không?',
        a: 'Không bao giờ! Bạn có thể xuất toàn bộ dữ liệu ra file Excel/PDF bất cứ lúc nào. Sau khi hủy, dữ liệu vẫn được lưu trữ 90 ngày để bạn có thời gian xuất về. Chúng tôi cam kết không xóa dữ liệu đột ngột.'
    },
];

// ── HOOKS ──
function useReveal() {
    const refs = useRef([]);
    const [visible, setVisible] = useState({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible((prev) => ({...prev, [entry.target.dataset.revealId]: true}));
                        observer.unobserve(entry.target);
                    }
                });
            },
            {threshold: 0.12}
        );
        refs.current.forEach((el) => {
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const ref = (id) => (el) => {
        if (el) {
            el.dataset.revealId = id;
            refs.current.push(el);
        }
    };

    const cls = (id, extra = '') => {
        const base = `${styles.reveal} ${extra}`;
        return visible[id] ? `${base} ${styles.revealVisible}` : base;
    };

    return {ref, cls};
}

// ── CHECK / X ICONS ──
const CheckIcon = () => (
    <svg viewBox="0 0 12 12">
        <polyline points="2,6 5,9 10,3"/>
    </svg>
);
const XIcon = () => (
    <svg viewBox="0 0 12 12">
        <path d="M2 2l8 8M10 2l-8 8"/>
    </svg>
);

// ══════════════════════════════════════════
// LANDING COMPONENT
// ══════════════════════════════════════════
const Landing = () => {
    const location = useLocation();
    const [featureTab, setFeatureTab] = useState('all');
    const [role, setRole] = useState('owner');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState(1);
    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const {ref, cls} = useReveal();
    const [lead, setLead] = useState({name: '', phone: '', email: ''});
    const [contact, setContact] = useState({name: '', email: '', message: ''});
    const [showTop, setShowTop] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {from: 'bot', text: 'Chào bạn! Mình là EzTro Bot. Bạn cần hỗ trợ gì?'},
        {from: 'bot', text: 'Bạn muốn demo nhanh hay hỏi về bảng giá?'},
        {from: 'bot', text: 'Gửi tin nhắn ở đây, chúng tôi phản hồi ngay hoặc qua email bạn cung cấp sau.'},
    ]);
    const [chatInput, setChatInput] = useState({message: ''});

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    };

    // scroll to section when navigated with state
    useEffect(() => {
        if (location.state?.scrollTo) {
            setTimeout(() => scrollToSection(location.state.scrollTo), 80);
        }
    }, [location.state]);

    // show scroll-to-top
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 320);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const sendChat = () => {
        if (!chatInput.message.trim()) return;
        const payload = {
            from: 'user',
            text: chatInput.message.trim(),
        };
        setChatMessages((prev) => [...prev, payload, {from: 'bot', text: 'Cảm ơn bạn! Team sẽ phản hồi trong vài phút.'}]);
        setChatInput({message: ''});
    };

    // Table filtering
    const filteredRows = TABLE_DATA.filter((row) => {
        const matchSearch = searchQuery === '' || `${row.room} ${row.name} ${row.phone}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'all' || row.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleSort = (col) => {
        if (sortCol === col) {
            setSortDir((d) => d * -1);
        } else {
            setSortCol(col);
            setSortDir(1);
        }
    };

    const sortedRows = [...filteredRows].sort((a, b) => {
        if (sortCol === null) return 0;
        const keys = ['room', 'name', 'price', 'status', 'monthly', 'contract'];
        const key = keys[sortCol];
        const va = a[key] || '';
        const vb = b[key] || '';
        const na = parseFloat(va.replace(/[^\d]/g, ''));
        const nb = parseFloat(vb.replace(/[^\d]/g, ''));
        if (!isNaN(na) && !isNaN(nb)) return (na - nb) * sortDir;
        return va.localeCompare(vb, 'vi') * sortDir;
    });

    // Pricing
    const prices = isYearly
        ? {
            pro: '239.000',
            ent: '639.000',
            proSave: '= 2.868.000đ/năm, tiết kiệm 720.000đ',
            entSave: '= 7.668.000đ/năm, tiết kiệm 1.920.000đ'
        }
        : {pro: '299.000', ent: '799.000', proSave: '', entSave: ''};

    const tagClass = (cls) => {
        const map = {
            Green: styles.tagGreen,
            Amber: styles.tagAmber,
            Red: styles.tagRed,
            Blue: styles.tagBlue,
            Gray: styles.tagGray
        };
        return `${styles.tag} ${map[cls] || ''}`;
    };

    const dotClass = (d, pulse) => {
        const map = {Green: styles.dotGreen, Amber: styles.dotAmber, Red: styles.dotRed};
        return `${styles.dot} ${map[d] || ''} ${pulse ? styles.dotPulse : ''}`;
    };

    return (
        <div className={styles.landing}>
            {/* ── GOOGLE FONTS ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,500&display=swap');
      `}</style>

            <Header onNav={scrollToSection}/>

            {/* ══ HERO ══ */}
            <section className={styles.hero}>
                <div className={styles.heroBg}/>
                <div className={styles.heroGrid}/>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <span className={styles.heroBadgePill}>MỚI</span>
                            Phiên bản 1.2 — Ra mắt thanh toán online &amp; e-hợp đồng
                        </div>
                        <h1 className={styles.heroH1}>
                            Quản lý nhà trọ<br/>
                            <span className={styles.accent}>thông minh hơn,</span>
                            <span className={styles.line2}>nhàn hơn mỗi ngày</span>
                        </h1>
                        <p className={styles.heroSub}>
                            Nền tảng SaaS all-in-one dành cho chủ trọ Việt Nam — quản lý phòng, thu tiền tự động, hợp
                            đồng điện tử, và hơn thế nữa. Khách thuê cũng có app riêng tiện lợi.
                        </p>
                        <div className={styles.heroActions}>
                            <button className={`${styles.btnSolid} ${styles.btnLg}`}
                                    onClick={() => scrollToSection('pricing')}>Bắt đầu miễn phí — 30 ngày
                            </button>
                            <button className={styles.btnLgOutline} onClick={() => scrollToSection('demo')}>Xem demo
                                thực tế ↓
                            </button>
                        </div>
                        <p className={styles.heroNote}>
                            <span>✓</span> Miễn phí 30 ngày &nbsp;·&nbsp;
                            <span>✓</span> Không cần thẻ tín dụng &nbsp;·&nbsp;
                            <span>✓</span> Hủy bất cứ lúc nào
                        </p>

                        {/* Quick lead form */}
                        <div className={styles.quickForm}>
                            <div className={styles.quickFormTitle}>Đăng ký nhanh</div>
                            <div className={styles.quickFormGrid}>
                                <input
                                    placeholder="Họ và tên"
                                    value={lead.name}
                                    onChange={(e) => setLead({...lead, name: e.target.value})}
                                />
                                <input
                                    placeholder="Số điện thoại"
                                    value={lead.phone}
                                    onChange={(e) => setLead({...lead, phone: e.target.value})}
                                />
                                <input
                                    placeholder="Email"
                                    value={lead.email}
                                    onChange={(e) => setLead({...lead, email: e.target.value})}
                                />
                                <button
                                    className={styles.btnSolid}
                                    onClick={() => {
                                        alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 24h.');
                                        setLead({name: '', phone: '', email: ''});
                                    }}
                                >
                                    Gửi ngay
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className={styles.heroVisual}>
                        <div className={styles.heroVisualInner}>
                            <div className={styles.browserBar}>
                                <div className={styles.browserDots}>
                                    <i className={styles.bdR}/><i className={styles.bdY}/><i className={styles.bdG}/>
                                </div>
                                <div className={styles.browserBarUrl}>
                                    <svg viewBox="0 0 16 16">
                                        <path
                                            d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM6.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8 10c-1.48 0-2.75.81-3.43 2h6.86C10.75 10.81 9.48 10 8 10z"
                                            fill="currentColor"/>
                                    </svg>
                                    ez_tro.vn/dashboard
                                </div>
                            </div>
                            <div className={styles.dashboardPreview}>
                                <div className={styles.dashHeader}>
                                    <div>
                                        <div className={styles.dashTitle}>Xin chào, anh Minh Tuấn 👋</div>
                                        <div className={styles.dashSubtitle}>Nhà trọ Dream House Nguyễn Thị Minh Khai — Quận 3,
                                            TP.HCM
                                        </div>
                                    </div>
                                    <div className={styles.dashDate}>Tháng 4 / 2026</div>
                                </div>
                                <div className={styles.dashStats}>
                                    {[
                                        {
                                            label: 'Tổng phòng',
                                            val: '24',
                                            valCls: '',
                                            change: '↑ Thêm 2 phòng tháng này',
                                            changeCls: 'Up'
                                        },
                                        {
                                            label: 'Đang thuê',
                                            val: '21',
                                            valCls: 'Green',
                                            change: '↑ Tỷ lệ: 87.5%',
                                            changeCls: 'Up'
                                        },
                                        {
                                            label: 'Doanh thu tháng',
                                            val: '84.2tr',
                                            valCls: '',
                                            change: '↑ +5.2% so tháng trước',
                                            changeCls: 'Up'
                                        },
                                        {
                                            label: 'Nợ tồn đọng',
                                            val: '3.5tr',
                                            valCls: 'Amber',
                                            change: '↓ 2 phòng chưa trả',
                                            changeCls: 'Down'
                                        },
                                    ].map((s, i) => (
                                        <div key={i} className={styles.statCard}>
                                            <div className={styles.statCardLabel}>{s.label}</div>
                                            <div
                                                className={`${styles.statCardVal} ${s.valCls === 'Green' ? styles.statCardValGreen : s.valCls === 'Amber' ? styles.statCardValAmber : ''}`}>{s.val}</div>
                                            <div
                                                className={`${styles.statCardChange} ${s.changeCls === 'Up' ? styles.statCardChangeUp : styles.statCardChangeDown}`}>{s.change}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.dashRow}>
                                    <div className={styles.dashCard}>
                                        <div className={styles.dashCardTitle}>Phòng gần đây <a href="#">Xem tất cả →</a>
                                        </div>
                                        {[
                                            {
                                                num: '101',
                                                name: 'Phòng 101',
                                                tenant: 'Nguyễn Văn An',
                                                tagCls: 'Green',
                                                price: '3.8tr'
                                            },
                                            {
                                                num: '102',
                                                name: 'Phòng 102',
                                                tenant: 'Trần Thị Bích',
                                                tagCls: 'Amber',
                                                price: '4.1tr'
                                            },
                                            {
                                                num: '103',
                                                name: 'Phòng 103',
                                                tenant: 'Lê Minh Khoa',
                                                tagCls: 'Green',
                                                price: '3.5tr'
                                            },
                                        ].map((r, i) => (
                                            <div key={i} className={styles.roomRow}>
                                                <div className={styles.roomInfo}>
                                                    <div className={styles.roomNum}>{r.num}</div>
                                                    <div>
                                                        <div className={styles.roomName}>{r.name}</div>
                                                        <div className={styles.roomTenant}>{r.tenant}</div>
                                                    </div>
                                                </div>
                                                <div className={styles.roomMeta}>
                          <span className={tagClass(r.tagCls)}>
                            <span className={dotClass(r.tagCls, false)}/>
                              {r.tagCls === 'Green' ? 'Đã trả' : 'Nợ'}
                          </span>
                                                    <div className={styles.roomPrice}>{r.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.dashCard}>
                                        <div className={styles.dashCardTitle}>Thông báo mới</div>
                                        {[
                                            {
                                                iconCls: 'Green',
                                                icon: '💰',
                                                text: 'P.105 — Phạm Lan vừa thanh toán 4.200.000đ',
                                                time: '5 phút trước'
                                            },
                                            {
                                                iconCls: 'Amber',
                                                icon: '⚠️',
                                                text: 'P.203 — Hợp đồng sắp hết hạn (còn 7 ngày)',
                                                time: '1 giờ trước'
                                            },
                                            {
                                                iconCls: 'Blue',
                                                icon: '🔧',
                                                text: 'P.108 — Yêu cầu sửa vòi nước đang chờ xử lý',
                                                time: '3 giờ trước'
                                            },
                                        ].map((n, i) => (
                                            <div key={i} className={styles.notifRow}>
                                                <div
                                                    className={`${styles.notifIcon} ${n.iconCls === 'Green' ? styles.notifIconGreen : n.iconCls === 'Amber' ? styles.notifIconAmber : styles.notifIconBlue}`}>{n.icon}</div>
                                                <div>
                                                    <div className={styles.notifText}>{n.text}</div>
                                                    <div className={styles.notifTime}>{n.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ STATS TICKER ══ */}
            <div className={styles.statsBar}>
                <div className={styles.statsBarInner}>
                    {[...STATS_TICKER, ...STATS_TICKER].map((s, i) => (
                        <div key={i} className={styles.statItem}>
                            <span className={styles.statNum}>{s.num}</span>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ LOGOS ══ */}
            <div className={styles.logoStrip}>
                <div className={styles.container}>
                    <div className={styles.logoStripInner}>
                        <span className={styles.logoStripLabel}>Đối tác & cổng thanh toán:</span>
                        {['VietQR', 'MoMo', 'ZaloPay', 'VNPay', 'SeABank', 'ACB'].map((name, i) => (
                            <div key={i} className={styles.logoPill}>{name}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ FEATURES ══ */}
            <section className={styles.featuresSection} id="features">
                <div className={styles.container}>
                    <div ref={ref('feat-intro')} className={cls('feat-intro')}>
                        <div className={styles.featuresIntro}>
                            <div>
                                <div className={styles.sectionEyebrow}>Tính năng</div>
                                <div className={styles.sectionH2}>Mọi thứ bạn cần,<br/><em>trong một nền tảng</em></div>
                                <p className={styles.sectionLead} style={{marginBottom: 0}}>Từ quản lý phòng, thu tiền
                                    tự động đến hợp đồng điện tử — EzTro lo hết để bạn chỉ cần làm điều quan trọng
                                    hơn.</p>
                            </div>
                            <div className={styles.featuresTab}>
                                {[['all', 'Tất cả'], ['owner', 'Chủ trọ'], ['tenant', 'Người thuê']].map(([val, label]) => (
                                    <button key={val}
                                            className={`${styles.ftab} ${featureTab === val ? styles.ftabActive : ''}`}
                                            onClick={() => setFeatureTab(val)}>{label}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div ref={ref('feat-grid')} className={cls('feat-grid', styles.revealDelay2)}>
                        <div className={styles.featuresGrid}>
                            {FEATURES.map((f, i) => {
                                const hidden = featureTab !== 'all' && f.group !== featureTab && f.group !== 'both';
                                if (featureTab === 'tenant' && f.group === 'owner') return null;
                                if (featureTab === 'owner' && f.group === 'tenant') return null;
                                return (
                                    <div key={i} className={styles.featCard}>
                                        <div
                                            className={`${styles.featIcon} ${styles[`featIcon${f.color}`]}`}>{f.icon}</div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                        <span className={styles.featLink}>Tìm hiểu thêm →</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ ROLES ══ */}
            <section className={styles.rolesSection} id="roles">
                <div className={styles.container}>
                    <div ref={ref('roles-head')} className={cls('roles-head')}>
                        <div className={styles.sectionEyebrow}>Dành cho ai?</div>
                        <div className={styles.sectionH2}>Hai vai trò,<br/><em>một nền tảng</em></div>
                    </div>
                    <div ref={ref('roles-tabs')} className={cls('roles-tabs', styles.revealDelay1)}>
                        <div className={styles.rolesTabs}>
                            {[['owner', '🏘️ Chủ nhà trọ'], ['tenant', '👤 Người thuê trọ']].map(([val, label]) => (
                                <button key={val} className={`${styles.rtab} ${role === val ? styles.rtabActive : ''}`}
                                        onClick={() => setRole(val)}>{label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Owner */}
                    <div className={`${styles.roleContent} ${role === 'owner' ? styles.roleContentActive : ''}`}>
                        <div className={styles.roleFeatures}>
                            {OWNER_FEATURES.map((f, i) => (
                                <div key={i} className={styles.rfItem}>
                                    <div className={styles.rfIcon}>{f.icon}</div>
                                    <div className={styles.rfText}><h4>{f.title}</h4><p>{f.desc}</p></div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.roleMockup}>
                            <div className={styles.mockupHeader}>
                                <span className={styles.mockupTitle}>🏘️ Tổng quan — Chủ trọ</span>
                                <div className={styles.mockAvatar}>MT</div>
                            </div>
                            <div className={styles.mockupBody}>
                                <div className={styles.miniStats}>
                                    {[
                                        {n: '21/24', nCls: 'Green', l: 'Phòng đang thuê'},
                                        {n: '84.2tr', nCls: '', l: 'Doanh thu tháng'},
                                        {n: '3.5tr', nCls: 'Amber', l: 'Tiền nợ tồn đọng'},
                                        {n: '3', nCls: 'Green', l: 'Yêu cầu đang chờ'},
                                    ].map((s, i) => (
                                        <div key={i} className={styles.miniStat}>
                                            <div
                                                className={`${styles.miniStatN} ${s.nCls === 'Green' ? styles.miniStatNGreen : s.nCls === 'Amber' ? styles.miniStatNAmber : ''}`}>{s.n}</div>
                                            <div className={styles.miniStatL}>{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.billSectionTitle}>Hóa đơn tháng 4</div>
                                {[
                                    {name: 'Phòng 101 — Nguyễn Văn An', amt: '3.850.000đ', paid: true},
                                    {name: 'Phòng 102 — Trần Thị Bích', amt: '4.100.000đ', paid: false},
                                    {name: 'Phòng 103 — Lê Minh Khoa', amt: '3.500.000đ', paid: true},
                                    {name: 'Phòng 201 — Phạm Thị Lan', amt: '4.200.000đ', paid: true},
                                    {name: 'Phòng 202 — Hoàng Văn Hải', amt: '3.800.000đ', paid: false},
                                ].map((b, i) => (
                                    <div key={i} className={styles.billRow}>
                                        <span className={styles.billName}>{b.name}</span>
                                        <span className={styles.billAmt}>{b.amt}</span>
                                        <span
                                            className={`${styles.billStatus} ${b.paid ? styles.billStatusPaid : styles.billStatusDue}`}>{b.paid ? 'Đã trả' : 'Nợ'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tenant */}
                    <div className={`${styles.roleContent} ${role === 'tenant' ? styles.roleContentActive : ''}`}>
                        <div className={styles.roleFeatures}>
                            {TENANT_FEATURES.map((f, i) => (
                                <div key={i} className={styles.rfItem}>
                                    <div className={styles.rfIcon}>{f.icon}</div>
                                    <div className={styles.rfText}><h4>{f.title}</h4><p>{f.desc}</p></div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.roleMockup}>
                            <div className={styles.mockupHeader}>
                                <span className={styles.mockupTitle}>📱 App người thuê</span>
                                <div className={styles.mockAvatar}
                                     style={{background: '#EFF6FF', color: '#1d4ed8'}}>VK
                                </div>
                            </div>
                            <div className={styles.mockupBody}>
                                <div className={styles.payCard}>
                                    <div className={styles.payCardLabel}>Phòng của bạn</div>
                                    <div className={styles.payCardRoom}>Phòng 305 · Nhà trọ Thảo Điền</div>
                                    <div className={styles.payCardMeta}>
                                        <div>
                                            <div className={styles.pcmLabel}>Tiền thuê tháng 4</div>
                                            <div className={styles.pcmVal}>4.350.000đ</div>
                                        </div>
                                        <div>
                                            <div className={styles.pcmLabel}>Hạn thanh toán</div>
                                            <div className={styles.pcmVal}>15/04/2025</div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.billSectionTitle}>Yêu cầu sửa chữa gần đây</div>
                                {[
                                    {
                                        iconBg: '#E1F5EE',
                                        icon: '✅',
                                        title: 'Thay bóng đèn toilet',
                                        date: '08/04/2025',
                                        done: true
                                    },
                                    {
                                        iconBg: '#FEF3C7',
                                        icon: '🔧',
                                        title: 'Vòi nước nóng bị rỉ',
                                        date: '10/04/2025',
                                        done: false
                                    },
                                    {
                                        iconBg: '#EFF6FF',
                                        icon: '🚪',
                                        title: 'Khóa cửa chính bị kẹt',
                                        date: '05/04/2025',
                                        done: true
                                    },
                                ].map((r, i) => (
                                    <div key={i} className={styles.reqRow}>
                                        <div className={styles.reqIcon} style={{background: r.iconBg}}>{r.icon}</div>
                                        <div className={styles.reqText}>
                                            <div className={styles.reqTitle}>{r.title}</div>
                                            <div className={styles.reqDate}>{r.date}</div>
                                        </div>
                                        <span
                                            className={`${styles.reqBadge} ${r.done ? styles.reqBadgeDone : styles.reqBadgeProg}`}>{r.done ? 'Hoàn thành' : 'Đang xử lý'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ DEMO TABLE ══ */}
            <section className={styles.demoSection} id="demo">
                <div className={styles.container}>
                    <div ref={ref('demo-head')} className={cls('demo-head')}>
                        <div className={styles.sectionEyebrow}>Demo trực tiếp</div>
                        <div className={styles.sectionH2}>Nhìn vào là hiểu ngay</div>
                        <p className={styles.sectionLead}>Giao diện quản lý phòng rõ ràng, thao tác đơn giản — không cần
                            hướng dẫn dài dòng.</p>
                    </div>
                    <div ref={ref('demo-table')} className={cls('demo-table', styles.revealDelay1)}>
                        <div className={styles.demoWrapper}>
                            <div className={styles.demoTopbar}>
                                <span
                                    className={styles.demoTopbarTitle}>Danh sách phòng — Nhà trọ 123 Nguyễn Văn Cừ</span>
                                <div className={styles.searchBox}>
                                    <svg viewBox="0 0 16 16">
                                        <circle cx="6.5" cy="6.5" r="4.5"/>
                                        <path d="M10.5 10.5l3 3"/>
                                    </svg>
                                    <input type="text" placeholder="Tìm phòng, người thuê..." value={searchQuery}
                                           onChange={(e) => {
                                               setSearchQuery(e.target.value);
                                               setStatusFilter('all');
                                           }}/>
                                </div>
                                {[['all', 'Tất cả'], ['Đã trả', 'Đã trả'], ['Chưa trả', 'Chưa trả']].map(([val, label]) => (
                                    <button key={val} className={styles.filterBtn} onClick={() => {
                                        setStatusFilter(val);
                                        setSearchQuery('');
                                    }}>
                                        <svg viewBox="0 0 16 16">
                                            <path d="M2 4h12M4 8h8M6 12h4"/>
                                        </svg>
                                        {label}
                                    </button>
                                ))}
                                <button className={styles.btnSolid} style={{fontSize: 13, padding: '7px 14px'}}
                                        onClick={() => alert('Thêm phòng mới')}>+ Thêm phòng
                                </button>
                            </div>
                            <div className={styles.demoTableWrap}>
                                <table className={styles.mainTable}>
                                    <thead>
                                    <tr>
                                        {['Phòng', 'Người thuê', 'Giá thuê', 'Trạng thái', 'Tháng này', 'Hạn HĐ', 'Thao tác'].map((h, i) => (
                                            <th key={i} onClick={() => i < 6 && handleSort(i)}>
                                                {h}
                                                {i < 6 && <svg viewBox="0 0 12 12">
                                                    <path d="M6 2v8M3 9l3 3 3-3M3 3l3-3 3 3"/>
                                                </svg>}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedRows.map((row, i) => (
                                        <tr key={i}>
                                            <td><span className={dotClass(row.dotClass, row.dotPulse)}
                                                      style={{marginRight: 8}}/>{row.room}</td>
                                            <td>
                                                <div className={styles.tenantCell}>
                                                    {row.avatar ? (
                                                        <div
                                                            className={`${styles.tAvatar} ${styles[`tAvatar${row.avatarClass}`]}`}>{row.avatar}</div>
                                                    ) : (
                                                        <div style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            background: 'var(--surface-3)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 16
                                                        }}>—</div>
                                                    )}
                                                    <div>
                                                        <div className={styles.tName}
                                                             style={!row.avatar ? {color: 'var(--ink-4)'} : {}}>{row.name}</div>
                                                        <div className={styles.tPhone}>{row.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{row.price}</td>
                                            <td><span className={tagClass(row.statusClass)}>{row.status}</span></td>
                                            <td>{row.monthly}</td>
                                            <td>{row.contract}</td>
                                            <td>
                                                {row.action === 'detail' && <button className={styles.tableFilterBtn}
                                                                                    onClick={() => alert(`Xem chi tiết ${row.room}`)}>Chi
                                                    tiết</button>}
                                                {row.action === 'remind' && <button
                                                    className={`${styles.tableFilterBtn} ${styles.tableFilterBtnAmber}`}
                                                    onClick={() => alert(`Gửi nhắc nợ cho ${row.name}`)}>Nhắc
                                                    nợ</button>}
                                                {row.action === 'post' && <button className={styles.btnSolid} style={{
                                                    fontSize: 12,
                                                    padding: '4px 10px'
                                                }} onClick={() => alert('Đăng tin cho thuê')}>Đăng tin</button>}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className={styles.demoFooter}>
                                <span>Hiển thị {sortedRows.length} / 24 phòng {currentPage > 1 ? `(Trang ${currentPage})` : ''}</span>
                                <div className={styles.pagination}>
                                    <button className={styles.pgBtn}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                                        <svg viewBox="0 0 12 12">
                                            <path d="M7.5 2L3.5 6l4 4"/>
                                        </svg>
                                    </button>
                                    {[1, 2, 3, 4].map((p) => (
                                        <button key={p}
                                                className={`${styles.pgBtn} ${currentPage === p ? styles.pgBtnActive : ''}`}
                                                onClick={() => setCurrentPage(p)}>{p}</button>
                                    ))}
                                    <button className={styles.pgBtn}
                                            onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}>
                                        <svg viewBox="0 0 12 12">
                                            <path d="M4.5 2L8.5 6l-4 4"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ PRICING ══ */}
            <section className={styles.pricingSection} id="pricing">
                <div className={styles.container}>
                    <div ref={ref('pricing-head')} className={cls('pricing-head')} style={{textAlign: 'center'}}>
                        <div className={styles.sectionEyebrow}>Bảng giá</div>
                        <div className={styles.sectionH2}>Đơn giản, <em>minh bạch</em></div>
                        <p className={styles.sectionLead} style={{margin: '0 auto 32px'}}>Không phí ẩn. Không cam kết
                            dài hạn. Nâng cấp hoặc hủy bất cứ lúc nào.</p>
                    </div>
                    <div ref={ref('pricing-toggle')} className={cls('pricing-toggle', styles.revealDelay1)}>
                        <div className={styles.pricingToggle}>
                            <span className={styles.pToggleLabel}>Theo tháng</span>
                            <button className={`${styles.pToggle} ${isYearly ? styles.pToggleOn : ''}`}
                                    onClick={() => setIsYearly(!isYearly)}/>
                            <span className={styles.pToggleLabel}>Theo năm</span>
                            {isYearly && <span className={styles.saveBadge}>Tiết kiệm 20%</span>}
                        </div>
                    </div>
                    <div ref={ref('pricing-grid')} className={cls('pricing-grid', styles.revealDelay2)}>
                        <div className={styles.pricingGrid}>
                            {/* FREE */}
                            <div className={styles.priceCard}>
                                <div className={styles.planIcon}>🌱</div>
                                <div className={styles.planName}>Miễn phí</div>
                                <div className={styles.planTagline}>Phù hợp để bắt đầu thử nghiệm</div>
                                <div className={styles.planPriceWrap}>
                                    <div className={styles.planPriceMain}>0<sup>đ</sup></div>
                                    <div className={styles.planPricePeriod}>mãi mãi miễn phí</div>
                                    <div className={styles.planPriceYearly}/>
                                </div>
                                <hr className={styles.planDivider}/>
                                <ul className={styles.planFeatList}>
                                    {['Tối đa 5 phòng', 'Hồ sơ người thuê cơ bản', 'Hóa đơn thủ công', 'Hỗ trợ qua email'].map((f, i) => (
                                        <li key={i}>
                                            <div className={styles.pfCheck}><CheckIcon/></div>
                                            {f}</li>
                                    ))}
                                    {['Nhắc nợ tự động', 'Thanh toán online', 'Hợp đồng điện tử'].map((f, i) => (
                                        <li key={i} className="disabled">
                                            <div className={styles.pfX}><XIcon/></div>
                                            {f}</li>
                                    ))}
                                </ul>
                                <button className={`${styles.planCta} ${styles.planCtaOutline}`}
                                        onClick={() => alert('Đăng ký tài khoản miễn phí')}>Bắt đầu miễn phí
                                </button>
                            </div>
                            {/* PRO */}
                            <div className={`${styles.priceCard} ${styles.priceCardPopular}`}>
                                <div className={styles.popularChip}>Phổ biến nhất</div>
                                <div className={styles.planIcon}>🚀</div>
                                <div className={styles.planName}>Chuyên nghiệp</div>
                                <div className={styles.planTagline}>Dành cho chủ trọ chuyên nghiệp</div>
                                <div className={styles.planPriceWrap}>
                                    <div className={styles.planPriceMain}>{prices.pro}<sup>đ</sup></div>
                                    <div className={styles.planPricePeriod}>/ tháng / nhà trọ</div>
                                    <div className={styles.planPriceYearly}>{prices.proSave}</div>
                                </div>
                                <hr className={styles.planDivider}/>
                                <ul className={styles.planFeatList}>
                                    {['Không giới hạn phòng', 'Hóa đơn & nhắc nợ tự động', 'Thanh toán online QR/Ví điện tử', 'Hợp đồng điện tử có giá trị PL', 'Nhắc qua Zalo + SMS', 'Báo cáo tài chính chi tiết', 'Hỗ trợ ưu tiên 24/7'].map((f, i) => (
                                        <li key={i}>
                                            <div className={styles.pfCheck}><CheckIcon/></div>
                                            {f}</li>
                                    ))}
                                </ul>
                                <button className={`${styles.planCta} ${styles.planCtaPrimary}`}
                                        onClick={() => alert('Bắt đầu dùng thử 30 ngày')}>Dùng thử 30 ngày miễn phí
                                </button>
                            </div>
                            {/* ENTERPRISE */}
                            <div className={styles.priceCard}>
                                <div className={styles.planIcon}>🏢</div>
                                <div className={styles.planName}>Doanh nghiệp</div>
                                <div className={styles.planTagline}>Cho chuỗi nhà trọ &amp; bất động sản lớn</div>
                                <div className={styles.planPriceWrap}>
                                    <div className={styles.planPriceMain}>{prices.ent}<sup>đ</sup></div>
                                    <div className={styles.planPricePeriod}>/ tháng</div>
                                    <div className={styles.planPriceYearly}>{prices.entSave}</div>
                                </div>
                                <hr className={styles.planDivider}/>
                                <ul className={styles.planFeatList}>
                                    {['Tất cả tính năng Pro', 'Quản lý nhiều cơ sở & chi nhánh', 'Phân quyền nhân viên linh hoạt', 'API tích hợp hệ thống kế toán', 'Báo cáo nâng cao, xuất tự động', 'Account Manager riêng', 'SLA uptime 99.9%'].map((f, i) => (
                                        <li key={i}>
                                            <div className={styles.pfCheck}><CheckIcon/></div>
                                            {f}</li>
                                    ))}
                                </ul>
                                <button className={`${styles.planCta} ${styles.planCtaOutline}`}
                                        onClick={() => alert('Liên hệ đội ngũ kinh doanh')}>Liên hệ tư vấn →
                                </button>
                            </div>
                        </div>
                    </div>
                    <div ref={ref('pricing-faq')} className={cls('pricing-faq')}>
                        <div className={styles.pricingFaq}>
                            <p>Còn băn khoăn? <a href="#faq">Xem câu hỏi thường gặp</a> hoặc <a href="#">chat với chúng
                                tôi</a> ngay bây giờ.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ TESTIMONIALS ══ */}
            <section className={styles.testimonialsSection}>
                <div className={styles.container}>
                    <div ref={ref('t-head')} className={cls('t-head')}
                         style={{textAlign: 'center', maxWidth: 600, margin: '0 auto 56px'}}>
                        <div className={styles.sectionEyebrow}>Đánh giá từ người dùng</div>
                        <div className={styles.sectionH2}>Chủ trọ nói gì về <em>EzTro?</em></div>
                    </div>
                    <div ref={ref('t-grid')} className={cls('t-grid', styles.revealDelay1)}>
                        <div className={styles.tGrid}>
                            {TESTIMONIALS.map((t, i) => (
                                <div key={i} className={styles.tCard}>
                                    <div className={styles.tStars}>{t.stars}</div>
                                    <p className={styles.tText}>{t.text}</p>
                                    <div className={styles.tAuthor}>
                                        <div className={styles.tAv}
                                             style={{background: t.avBg, color: t.avColor}}>{t.av}</div>
                                        <div>
                                            <div className={styles.tName}>{t.name}</div>
                                            <div className={styles.tRole}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FAQ ══ */}
            <section className={styles.faqSection} id="faq">
                <div className={styles.container}>
                    <div ref={ref('faq-head')} className={cls('faq-head')}
                         style={{textAlign: 'center', maxWidth: 560, margin: '0 auto 56px'}}>
                        <div className={styles.sectionEyebrow}>FAQ</div>
                        <div className={styles.sectionH2}>Câu hỏi <em>thường gặp</em></div>
                    </div>
                    <div ref={ref('faq-grid')} className={cls('faq-grid', styles.revealDelay1)}>
                        <div className={styles.faqGrid}>
                            {FAQS.map((faq, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                                         onClick={() => setOpenFaq(isOpen ? null : i)}>
                                        <div className={styles.faqQ}>
                                            {faq.q}
                                            <div className={`${styles.faqIcon} ${isOpen ? styles.faqItemOpen : ''}`}>
                                                <svg viewBox="0 0 12 12">
                                                    <path d="M2 5l4 4 4-4M6 2v6"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className={`${styles.faqA} ${isOpen ? styles.faqAOpen : ''}`}>
                                            <div className={styles.faqAInner}>{faq.a}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <section className={styles.finalCta}>
                <div className={styles.finalCtaBg}/>
                <div className={styles.container}>
                    <div className={styles.finalCtaContent}>
                        <h2 className={styles.finalCtaH2}>Sẵn sàng quản lý nhà trọ<br/><em>thông minh hơn?</em></h2>
                        <p className={styles.finalCtaP}>Tham gia cùng hơn 3.800 chủ trọ đang dùng EzTro mỗi ngày. Bắt
                            đầu miễn phí, không cần thẻ tín dụng.</p>
                        <div className={styles.finalCtaActions}>
                            <button className={styles.btnWhite} onClick={() => scrollToSection('pricing')}>Tạo tài khoản
                                miễn phí →
                            </button>
                            <button className={styles.btnBorderWhite}
                                    onClick={() => alert('Đặt lịch demo 1-1 với đội ngũ EzTro')}>Đặt lịch demo 1-1
                            </button>
                        </div>
                        <div className={styles.finalTrust}>
                            {[
                                {
                                    icon: <svg viewBox="0 0 16 16">
                                        <path d="M8 1l1.5 4.5H15l-4.5 3 1.5 4.5L8 10.5 4 13l1.5-4.5L1 5.5h5.5z"/>
                                    </svg>, label: 'Đánh giá 4.9/5'
                                },
                                {
                                    icon: <svg viewBox="0 0 16 16">
                                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4v4l3 2"/>
                                    </svg>, label: 'Dùng thử 30 ngày'
                                },
                                {
                                    icon: <svg viewBox="0 0 16 16">
                                        <rect x="2" y="5" width="12" height="9" rx="1"/>
                                        <path d="M5 5V4a3 3 0 016 0v1"/>
                                    </svg>, label: 'Bảo mật SSL'
                                },
                                {
                                    icon: <svg viewBox="0 0 16 16">
                                        <path d="M8 1l1.5 4.5H15l-4.5 3 1.5 4.5L8 10.5 4 13l1.5-4.5L1 5.5h5.5z"/>
                                    </svg>, label: 'Hỗ trợ 24/7'
                                },
                            ].map((t, i) => (
                                <div key={i} className={styles.trustItem}>{t.icon}{t.label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ CONTACT BOX ══ */}
            <section className={styles.contactSection}>
                <div className={styles.container}>
                    <div className={styles.contactCard}>
                        <div>
                            <div className={styles.sectionEyebrow}>Liên hệ nhanh</div>
                            <div className={styles.sectionH2} style={{marginBottom: 8}}>Gửi tin nhắn cho chúng tôi</div>
                            <p className={styles.sectionLead} style={{marginBottom: 16}}>Cần demo riêng hoặc câu hỏi về tính năng? Hãy để lại lời nhắn, đội ngũ sẽ phản hồi trong 24 giờ.</p>
                        </div>
                        <div className={styles.contactForm}>
                            <input
                                placeholder="Họ và tên"
                                value={contact.name}
                                onChange={(e) => setContact({...contact, name: e.target.value})}
                            />
                            <input
                                placeholder="Email"
                                type="email"
                                value={contact.email}
                                onChange={(e) => setContact({...contact, email: e.target.value})}
                            />
                            <textarea
                                rows="3"
                                placeholder="Lời nhắn của bạn"
                                value={contact.message}
                                onChange={(e) => setContact({...contact, message: e.target.value})}
                            />
                            <button
                                className={styles.btnSolid}
                                onClick={() => {
                                    alert('Đã nhận tin nhắn! Chúng tôi sẽ trả lời sớm.');
                                    setContact({name: '', email: '', message: ''});
                                }}
                            >
                                Gửi tin nhắn
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>

            {/* Mobile floating CTA */}
            <div className={styles.mobileCtaBar}>
                <div className={styles.mobileCtaText}>Dùng thử miễn phí 30 ngày</div>
                <button className={styles.btnSolid} onClick={() => scrollToSection('pricing')}>Bắt đầu</button>
            </div>

            {/* Scroll to top */}
            {showTop && (
                <button className={styles.scrollTopBtn} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                    ↑
                </button>
            )}

            {/* Chat widget */}
            <div className={`${styles.chatWidget} ${chatOpen ? styles.chatWidgetOpen : ''}`}>
                {!chatOpen && (
                    <button className={styles.chatLauncher} onClick={() => setChatOpen(true)}>
                        💬
                    </button>
                )}
                {chatOpen && (
                    <div className={styles.chatBox}>
                        <div className={styles.chatHeader}>
                            <div>
                                <div className={styles.chatTitle}>Chat với EzTro</div>
                                <div className={styles.chatSubtitle}>Online • phản hồi vài phút</div>
                            </div>
                            <button className={styles.chatClose} onClick={() => setChatOpen(false)}>×</button>
                        </div>
                        <div className={styles.chatBody}>
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`${styles.chatBubble} ${m.from === 'user' ? styles.chatUser : styles.chatBot}`}>
                                    {m.text}
                                </div>
                            ))}
                        </div>
                        <div className={styles.chatForm}>
                            <div className={styles.chatSendRow}>
                                <textarea
                                    rows="2"
                                    placeholder="Nội dung tin nhắn..."
                                    value={chatInput.message}
                                    onChange={(e) => setChatInput({message: e.target.value})}
                                />
                                <button className={styles.btnSolid} onClick={sendChat}>Gửi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Landing;

import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Header from '~/components/Marketing/Header';
import Footer from '~/components/Marketing/Footer';
import styles from './Careers.module.scss';

const BENEFITS = [
    {title: 'Remote linh hoạt', desc: 'Làm việc hybrid tại TP.HCM hoặc remote 2-3 ngày/tuần, hỗ trợ setup workstation.'},
    {title: 'Quyền sở hữu', desc: 'Stock option cho key member, bonus theo OKR hàng quý.'},
    {title: 'Học tập liên tục', desc: 'Budget 8.000.000đ/năm cho sách, khóa học, conference.'},
    {title: 'Sức khỏe & tinh thần', desc: 'Bảo hiểm sức khỏe, ngày nghỉ recharge, hỗ trợ trị liệu tâm lý khi cần.'},
];

const OPENINGS = [
    {
        title: 'Senior Frontend Engineer (React)',
        type: 'Full-time · TP.HCM/Remote',
        tags: ['React', 'TypeScript', 'Design System'],
        desc: 'Xây dựng trải nghiệm SaaS mượt trên web & PWA, tối ưu hiệu năng dashboard real-time.'
    },
    {
        title: 'Backend Engineer (Node/Java/Spring)',
        type: 'Full-time · TP.HCM/Remote',
        tags: ['Microservice', 'Payment', 'Security'],
        desc: 'Thiết kế dịch vụ thu tiền, hợp đồng điện tử, bảo mật dữ liệu, uptime 99.9%.'
    },
    {
        title: 'Product Designer',
        type: 'Full-time · TP.HCM',
        tags: ['UX Research', 'UI', 'Prototyping'],
        desc: 'Nghiên cứu hành vi chủ trọ & người thuê, thiết kế flow thu tiền, sửa chữa, onboarding.'
    },
    {
        title: 'Customer Success Specialist',
        type: 'Full-time · Hà Nội/TP.HCM',
        tags: ['Onboarding', 'Support', 'Training'],
        desc: 'Onboard chủ trọ mới, đào tạo sử dụng app, ghi nhận feedback để cải tiến sản phẩm.'
    },
];

const Careers = () => {
    const navigate = useNavigate();
    const [openJob, setOpenJob] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        message: '',
        cv: null,
    });

    const positionOptions = useMemo(() => OPENINGS.map((o) => o.title), []);

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        document.title = 'Tuyển dụng EzTro - Gia nhập đội ngũ';
    }, []);

    const handleApply = (jobTitle) => {
        setFormData((prev) => ({...prev, position: jobTitle || prev.position}));
        const job = OPENINGS.find((o) => o.title === jobTitle) || null;
        setOpenJob(job);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Fake submit for now
        alert('Cảm ơn bạn! Hồ sơ đã được gửi. Chúng tôi sẽ liên hệ sớm.');
        setFormData({fullName: '', email: '', phone: '', position: '', message: '', cv: null});
        setOpenJob(null);
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({...prev, cv: file}));
    };

    return (
        <div className={styles.page}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
      `}</style>

            <Header/>

            <header className={styles.hero}>
                <div className={styles.heroBg}/>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <p className={styles.eyebrow}>Tuyển dụng</p>
                        <h1>Gia nhập đội ngũ <em>EzTro</em><br/>Xây nền tảng vận hành nhà trọ Việt Nam</h1>
                        <p className={styles.lead}>Chúng tôi là team product-first, thích giải quyết vấn đề thực tế của hàng ngàn chủ trọ. Nếu bạn thích ship nhanh, học nhanh và làm điều có tác động rõ ràng, bạn sẽ hợp.</p>
                        <div className={styles.heroActions}>
                            <button className={styles.btnPrimary} onClick={() => document.getElementById('openings')?.scrollIntoView({behavior: 'smooth'})}>Xem vị trí mở</button>
                            <button className={styles.btnGhost} onClick={() => navigate('/about')}>Tìm hiểu về EzTro</button>
                        </div>
                        <div className={styles.heroBadges}>
                            <span>Series Seed · 2024</span>
                            <span>30k+ giao dịch/tháng</span>
                            <span>Team 20+ người · 1 thành phố</span>
                        </div>
                    </div>
                    <div className={styles.heroPanel}>
                        <div className={styles.panelTitle}>Chúng tôi tìm kiếm</div>
                        <ul>
                            <li>Người thích chủ động, rõ ràng, thích feedback thẳng.</li>
                            <li>Ưu tiên tác động thực tế hơn slide deck.</li>
                            <li>Sẵn sàng xuống hiện trường gặp chủ trọ, người thuê.</li>
                        </ul>
                        <div className={styles.panelNote}>Chưa thấy vị trí phù hợp? Gửi hồ sơ mở: <a href="mailto:careers@eztro.vn">careers@eztro.vn</a></div>
                    </div>
                </div>
            </header>

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.eyebrow}>Phúc lợi</p>
                            <h2>Chúng tôi chăm lo <em>để bạn tập trung làm tốt</em></h2>
                        </div>
                        <p className={styles.sectionLead}>Mọi chính sách đều tối giản, rõ ràng và thực sự dùng được.</p>
                    </div>
                    <div className={styles.benefitsGrid}>
                        {BENEFITS.map((b, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardBadge}>{`0${i + 1}`}</div>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.sectionAlt} id="openings">
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.eyebrow}>Vị trí đang tuyển</p>
                            <h2>Gia nhập team <em>product-first</em></h2>
                        </div>
                        <p className={styles.sectionLead}>Ứng tuyển nhanh qua email hoặc gửi LinkedIn/GitHub kèm vài sản phẩm từng làm.</p>
                    </div>
                    <div className={styles.openingsGrid}>
                        {OPENINGS.map((o, i) => (
                            <div key={i} className={styles.openingCard} onClick={() => handleApply(o.title)}>
                                <div>
                                    <div className={styles.openingTitle}>{o.title}</div>
                                    <div className={styles.openingType}>{o.type}</div>
                                    <p className={styles.openingDesc}>{o.desc}</p>
                                </div>
                                <div className={styles.tags}>
                                    {o.tags.map((t, j) => <span key={j}>{t}</span>)}
                                </div>
                                <div className={styles.actions}>
                                    <button className={styles.btnPrimary} onClick={(e) => {
                                        e.stopPropagation();
                                        handleApply(o.title);
                                    }}>Ứng tuyển</button>
                                    <button className={styles.btnGhost} onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/about');
                                    }}>Xem văn hóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHead}>
                        <div>
                            <p className={styles.eyebrow}>Ứng tuyển nhanh</p>
                            <h2>Gửi hồ sơ <em>trực tiếp</em> cho chúng tôi</h2>
                        </div>
                        <p className={styles.sectionLead}>Điền thông tin, chọn vị trí và đính kèm CV (PDF/DOC). Đội ngũ sẽ phản hồi trong 48 giờ.</p>
                    </div>
                    <form className={styles.applyForm} onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            <label>Họ và tên*</label>
                            <input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A"/>
                        </div>
                        <div className={styles.formGrid}>
                            <div>
                                <label>Email*</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ban@eztro.vn"/>
                            </div>
                            <div>
                                <label>Số điện thoại</label>
                                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="090..." />
                            </div>
                        </div>
                        <div className={styles.formGrid}>
                            <div>
                                <label>Vị trí ứng tuyển*</label>
                                <select required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}>
                                    <option value="">Chọn vị trí</option>
                                    {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Đính kèm CV (PDF/DOC)</label>
                                <div className={styles.fileInput}>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile}/>
                                    <span>{formData.cv ? formData.cv.name : 'Chưa chọn file'}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <label>Lời nhắn</label>
                            <textarea rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Bạn mong muốn giải quyết vấn đề gì tại EzTro?"/>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.btnPrimary}>Gửi hồ sơ</button>
                            <button type="button" className={styles.btnGhost} onClick={() => window.location.href = 'mailto:careers@eztro.vn'}>Gửi qua email</button>
                        </div>
                    </form>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.ctaCard}>
                        <div>
                            <p className={styles.eyebrow}>Ứng tuyển mở</p>
                            <h2>Không thấy vị trí phù hợp? Hãy cho chúng tôi biết bạn có thể giúp gì.</h2>
                            <p className={styles.sectionLead}>Gửi CV/portfolio và vài dòng về vấn đề bạn muốn giải quyết tại EzTro.</p>
                        </div>
                        <div className={styles.ctaActions}>
                            <button className={styles.btnPrimary} onClick={() => window.location.href = 'mailto:careers@eztro.vn'}>Gửi hồ sơ</button>
                            <button className={styles.btnGhost} onClick={() => navigate('/')}>Xem sản phẩm</button>
                        </div>
                    </div>
                </div>
            </section>

            {openJob && (
                <div className={styles.modalOverlay} onClick={() => setOpenJob(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <div className={styles.modalEyebrow}>Chi tiết vị trí</div>
                                <h3>{openJob.title}</h3>
                                <div className={styles.modalType}>{openJob.type}</div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setOpenJob(null)}>×</button>
                        </div>
                        <p className={styles.modalDesc}>{openJob.desc}</p>
                        <div className={styles.modalTags}>
                            {openJob.tags.map((t, i) => <span key={i}>{t}</span>)}
                        </div>
                        <form className={styles.modalForm} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <label>Họ và tên*</label>
                                <input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                            </div>
                            <div className={styles.formGrid}>
                                <div>
                                    <label>Email*</label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}/>
                                </div>
                                <div>
                                    <label>Điện thoại</label>
                                    <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}/>
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div>
                                    <label>Vị trí ứng tuyển</label>
                                    <input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}/>
                                </div>
                                <div>
                                    <label>Đính kèm CV (PDF/DOC)</label>
                                    <div className={styles.fileInput}>
                                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile}/>
                                        <span>{formData.cv ? formData.cv.name : 'Chưa chọn file'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <label>Lời nhắn</label>
                                <textarea rows="3" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}/>
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.btnPrimary}>Gửi ứng tuyển</button>
                                <button type="button" className={styles.btnGhost} onClick={() => window.location.href = 'mailto:careers@eztro.vn?subject=Ứng tuyển ' + encodeURIComponent(openJob.title)}>Gửi qua email</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer/>
        </div>
    );
};

export default Careers;

import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styles from '~/pages/General/Landing/Landing.module.scss';

const LogoIcon = () => (
    <svg viewBox="0 0 20 20">
        <path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z"/>
    </svg>
);

const Header = ({onNav}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleNav = (target) => {
        const goLandingAndScroll = () => navigate('/', {state: {scrollTo: target}});

        if (target === 'about') {
            navigate('/about');
            return setMobileOpen(false);
        }
        if (target === 'careers') {
            navigate('/careers');
            return setMobileOpen(false);
        }

        if (location.pathname === '/') {
            if (onNav) onNav(target);
            else document.getElementById(target)?.scrollIntoView({behavior: 'smooth'});
        } else {
            goLandingAndScroll();
        }
        setMobileOpen(false);
    };

    const navClass = (target) => {
        const pathname = location.pathname;
        if (target === 'about' && pathname === '/about') return styles.navActive;
        if (target === 'careers' && pathname === '/careers') return styles.navActive;
        if (target === 'home' && pathname === '/') return styles.navActive;
        return '';
    };

    return (
        <>
            <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
                <div className={styles.navLogo} onClick={() => navigate('/')}>
                    <div className={styles.logoMark}><LogoIcon/></div>
                    <span className={styles.logoText}>EZ<span>Tro</span></span>
                </div>
                <div className={styles.navLinks}>
                    <a className={navClass('home')} onClick={() => handleNav('features')}>Tính năng</a>
                    <a onClick={() => handleNav('pricing')}>Bảng giá</a>
                    <a onClick={() => handleNav('roles')}>Chủ trọ &amp; Khách</a>
                    <a className={navClass('about')} onClick={() => handleNav('about')}>Về chúng tôi</a>
                    <a className={navClass('careers')} onClick={() => handleNav('careers')}>Tuyển dụng</a>
                    <a onClick={() => handleNav('faq')}>FAQ</a>
                </div>
                <div className={styles.navRight}>
                    <button className={styles.btnGhost} type="button" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </button>
                    <button className={styles.btnSolid} onClick={() => handleNav('pricing')}>Dùng thử miễn phí →
                    </button>
                </div>
                <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
                    <span style={mobileOpen ? {transform: 'rotate(45deg) translateY(8px)'} : {}}/>
                    <span style={mobileOpen ? {opacity: 0} : {}}/>
                    <span style={mobileOpen ? {transform: 'rotate(-45deg) translateY(-8px)'} : {}}/>
                </button>
            </nav>

            <div className={`${styles.navMobile} ${mobileOpen ? styles.navMobileOpen : ''}`}>
                <a onClick={() => handleNav('features')}>Tính năng</a>
                <a onClick={() => handleNav('pricing')}>Bảng giá</a>
                <a onClick={() => handleNav('roles')}>Chủ trọ &amp; Khách</a>
                <a onClick={() => handleNav('about')}>Về chúng tôi</a>
                <a onClick={() => handleNav('careers')}>Tuyển dụng</a>
                <a onClick={() => handleNav('faq')}>FAQ</a>
                <a style={{color: 'var(--green)', fontWeight: 600, padding: '12px 16px'}}
                   onClick={() => handleNav('pricing')}>Dùng thử miễn phí →</a>
            </div>
        </>
    );
};

export default Header;

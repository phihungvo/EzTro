import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '~/routes/AuthContext';
import { login as loginService } from '~/service/admin/user';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import * as THREE from 'three';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const mountRef = useRef(null);
    const sceneRef = useRef(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 20, 100);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(15, 10, 15);
        camera.lookAt(0, 3, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(10, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xffa500, 0.3);
        fillLight.position.set(-5, 10, -5);
        scene.add(fillLight);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x5d8c5d,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Road
        const roadGeometry = new THREE.PlaneGeometry(4, 50);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(5, 0.01, 0);
        road.receiveShadow = true;
        scene.add(road);

        // Road markings
        for (let i = -20; i < 20; i += 3) {
            const markingGeometry = new THREE.PlaneGeometry(0.3, 1.5);
            const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(5, 0.02, i);
            scene.add(marking);
        }

        // Main Building (Apartment/Boarding House)
        const createBuilding = (x, y, z, width, height, depth, color) => {
            const building = new THREE.Group();

            // Main structure
            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const buildingMaterial = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7,
                metalness: 0.1
            });
            const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
            buildingMesh.castShadow = true;
            buildingMesh.receiveShadow = true;
            building.add(buildingMesh);

            // Windows
            const windowRows = Math.floor(height / 1.5);
            const windowCols = Math.floor(width / 1.5);

            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const windowGeometry = new THREE.BoxGeometry(0.8, 1, 0.2);
                    const isLit = Math.random() > 0.3;
                    const windowMaterial = new THREE.MeshStandardMaterial({
                        color: isLit ? 0xffeb99 : 0x4a90e2,
                        emissive: isLit ? 0xffeb99 : 0x000000,
                        emissiveIntensity: isLit ? 0.5 : 0,
                        roughness: 0.3,
                        metalness: 0.8
                    });
                    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                    windowMesh.position.set(
                        -width/2 + 1 + col * 1.5,
                        -height/2 + 1 + row * 1.5,
                        depth/2 + 0.1
                    );
                    building.add(windowMesh);

                    // Window frame
                    const frameGeometry = new THREE.BoxGeometry(0.9, 1.1, 0.1);
                    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                    frame.position.copy(windowMesh.position);
                    frame.position.z -= 0.05;
                    building.add(frame);
                }
            }

            // Roof
            const roofGeometry = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
            const roofMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.8
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = height / 2 + 0.25;
            roof.castShadow = true;
            building.add(roof);

            // Sign
            const signGeometry = new THREE.BoxGeometry(3, 1, 0.2);
            const signMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6b6b,
                emissive: 0xff6b6b,
                emissiveIntensity: 0.3
            });
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(0, height / 2 - 1, depth / 2 + 0.2);
            building.add(sign);

            // Sign text (using simple geometry)
            const textGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.1);
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const text = new THREE.Mesh(textGeometry, textMaterial);
            text.position.set(0, height / 2 - 1, depth / 2 + 0.3);
            building.add(text);

            building.position.set(x, y, z);
            return building;
        };

        // Add main boarding house
        const mainBuilding = createBuilding(0, 4, 0, 6, 8, 4, 0xf4a460);
        scene.add(mainBuilding);

        // Add smaller building
        const smallBuilding = createBuilding(-8, 2.5, -5, 4, 5, 3, 0xe8b4a0);
        scene.add(smallBuilding);

        // Trees
        const createTree = (x, z) => {
            const tree = new THREE.Group();

            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.25, 2, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            trunk.castShadow = true;
            tree.add(trunk);

            // Foliage (3 spheres stacked)
            const foliageGeometry = new THREE.SphereGeometry(1, 8, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: 0x228b22,
                roughness: 0.9
            });

            for (let i = 0; i < 3; i++) {
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = 2 + i * 0.8;
                foliage.scale.set(1 - i * 0.2, 1 - i * 0.2, 1 - i * 0.2);
                foliage.castShadow = true;
                tree.add(foliage);
            }

            tree.position.set(x, 0, z);
            return tree;
        };

        // Add trees
        const treePositions = [
            [-10, -8], [-10, 8], [10, -8], [10, 8],
            [-5, -10], [12, -5], [-8, 10], [12, 10]
        ];
        treePositions.forEach(([x, z]) => scene.add(createTree(x, z)));

        // Fence
        const createFence = (x, z, rotation = 0) => {
            const fence = new THREE.Group();

            for (let i = 0; i < 10; i++) {
                const postGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
                const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(i * 0.5, 0.75, 0);
                post.castShadow = true;
                fence.add(post);
            }

            // Horizontal bars
            for (let i = 0; i < 2; i++) {
                const barGeometry = new THREE.BoxGeometry(4.5, 0.08, 0.08);
                const barMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
                const bar = new THREE.Mesh(barGeometry, barMaterial);
                bar.position.set(2.25, 0.5 + i * 0.5, 0);
                fence.add(bar);
            }

            fence.position.set(x, 0, z);
            fence.rotation.y = rotation;
            return fence;
        };

        scene.add(createFence(-5, -12, 0));
        scene.add(createFence(-5, 12, 0));

        // Clouds
        const createCloud = (x, y, z) => {
            const cloud = new THREE.Group();
            const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });

            for (let i = 0; i < 5; i++) {
                const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
                sphere.position.set(
                    Math.random() * 2 - 1,
                    Math.random() * 0.5,
                    Math.random() * 2 - 1
                );
                sphere.scale.set(
                    0.8 + Math.random() * 0.5,
                    0.6 + Math.random() * 0.4,
                    0.8 + Math.random() * 0.5
                );
                cloud.add(sphere);
            }

            cloud.position.set(x, y, z);
            return cloud;
        };

        const clouds = [];
        for (let i = 0; i < 8; i++) {
            const cloud = createCloud(
                Math.random() * 40 - 20,
                15 + Math.random() * 5,
                Math.random() * 40 - 20
            );
            clouds.push(cloud);
            scene.add(cloud);
        }

        // Animation
        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.01;

            // Rotate camera slightly
            camera.position.x = 15 * Math.cos(time * 0.1);
            camera.position.z = 15 * Math.sin(time * 0.1);
            camera.lookAt(0, 3, 0);

            // Animate clouds
            clouds.forEach((cloud, index) => {
                cloud.position.x += 0.01;
                if (cloud.position.x > 25) cloud.position.x = -25;
            });

            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            message.error('Vui lòng nhập đầy đủ thông tin!');  // Thay alert bằng message
            return;
        }

        setLoading(true);
        try {
            const token = await loginService(username, password);  // Gọi API thật
            if (!token) {
                message.error('Đăng nhập thất bại. Kiểm tra lại thông tin.');
                return;
            }

            login(token);  // Cập nhật auth context
            message.success('Đăng nhập thành công!');
            navigate('/dashboard');  // Redirect (thay '/dashboard' bằng route mong muốn)
        } catch (err) {
            console.error(err);
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: 'hidden'
        }}>
            {/* 3D Scene */}
            <div ref={mountRef} style={{ flex: 1, position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: 40,
                    left: 40,
                    zIndex: 10,
                    color: '#fff',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                    <h1 style={{
                        fontSize: 48,
                        margin: 0,
                        fontWeight: 800,
                        letterSpacing: 2
                    }}>EZ_TRO</h1>
                    <p style={{
                        fontSize: 18,
                        margin: '8px 0 0 0',
                        opacity: 0.9
                    }}>Tìm trọ dễ dàng - Sống thoải mái</p>
                </div>
            </div>

            {/* Login Form */}
            <div style={{
                width: 480,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                boxShadow: '-10px 0 30px rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 400,
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: 24,
                    padding: 48,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h2 style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#1a1a2e',
                        marginBottom: 12,
                        textAlign: 'center'
                    }}>Chào mừng trở lại</h2>

                    <p style={{
                        color: '#6b7280',
                        fontSize: 15,
                        textAlign: 'center',
                        marginBottom: 32
                    }}>Đăng nhập để tiếp tục</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 52,
                                    padding: '0 16px',
                                    fontSize: 15,
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 12,
                                    background: '#fafbfc',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.background = '#fafbfc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20, position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 52,
                                    padding: '0 50px 0 16px',
                                    fontSize: 15,
                                    border: '2px solid #e5e7eb',
                                    borderRadius: 12,
                                    background: '#fafbfc',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.background = '#fafbfc';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 20,
                                    color: '#6b7280'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: 54,
                                fontSize: 16,
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                marginTop: 8,
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>

                        <p style={{
                            marginTop: 24,
                            color: '#6b7280',
                            fontSize: 14,
                            textAlign: 'center'
                        }}>
                            Chưa có tài khoản?{' '}
                            <a href="#" style={{
                                color: '#667eea',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                Đăng ký
                            </a>
                        </p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#9ca3af',
                            margin: '28px 0 24px',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
                            <span style={{ padding: '0 16px' }}>Hoặc</span>
                            <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { icon: 'G', text: 'Tiếp tục với Google', color: '#ea4335' },
                                { icon: '', text: 'Tiếp tục với Apple', color: '#000' },
                                { icon: '📱', text: 'Tiếp tục với Điện thoại', color: '#25D366' }
                            ].map((btn, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    style={{
                                        height: 48,
                                        borderRadius: 12,
                                        border: '2px solid #e5e7eb',
                                        background: '#fff',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                    }}
                                >
                                    <span style={{ fontSize: 18 }}>{btn.icon}</span>
                                    {btn.text}
                                </button>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
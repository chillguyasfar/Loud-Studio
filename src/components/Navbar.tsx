import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Twitter, Youtube, Star } from 'lucide-react';

const GlitchLogo = () => {
    const [text, setText] = useState("LOUD");
    const [isGlitching, setIsGlitching] = useState(false);
    const chars = "!@#$%^&*()_+{}[]";
    const intervalRef = useRef<any>(null);

    const startGlitch = () => {
        setIsGlitching(true);
        let iterations = 0;
        const maxIterations = 6;
        intervalRef.current = setInterval(() => {
            setText(
                "LOUD"
                    .split("")
                    .map(() => chars[Math.floor(Math.random() * chars.length)])
                    .join("")
            );
            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(intervalRef.current);
                setText("LOUD");
                setIsGlitching(false);
            }
        }, 80);
    };

    return (
        <div 
            className="flex items-center gap-1 cursor-pointer group"
            onMouseEnter={startGlitch}
        >
            <div className="relative">
                <span 
                    className={`font-display text-[2.2rem] leading-none text-brand-yellow transition-all duration-100 ${isGlitching ? 'rgb-split' : ''}`}
                    style={{ textShadow: isGlitching ? '-2px 0 #FF1500, 2px 0 cyan' : 'none' }}
                >
                    {text}
                </span>
                <span className="text-brand-red ml-1">●</span>
            </div>
            <div className="flex flex-col">
                <span className="font-mono text-[0.5rem] text-[#888] tracking-[0.3em] leading-tight">STUDIO</span>
            </div>

            <style>{`
                .rgb-split {
                    animation: glitch-anim 0.4s infinite;
                }
                @keyframes glitch-anim {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 1px); }
                    40% { transform: translate(2px, -1px); }
                    60% { transform: translate(-1px, -2px); }
                    80% { transform: translate(1px, 2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </div>
    );
};

const NavLink = ({ text, badge, active }: { text: string; badge?: string; active?: boolean }) => {
    const letters = text.split("");
    
    return (
        <motion.a 
            href={`#${text.toLowerCase()}`}
            className="relative group flex items-center gap-1 py-2 px-1 hover-trigger"
            whileHover="hover"
        >
            <div className="flex group-hover:animate-wiggle">
                {letters.map((l, i) => (
                    <motion.span
                        key={i}
                        variants={{
                            hover: { color: "#FFE600", transition: { delay: i * 0.03 } }
                        }}
                        className="font-display text-xl text-[#888] tracking-[0.2em] transition-colors duration-200 uppercase"
                    >
                        {l}
                    </motion.span>
                ))}
            </div>

            {badge && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 1 }}
                    className="absolute -top-1 -right-4 bg-brand-yellow text-bg font-mono text-[0.5rem] font-bold px-1 py-0.5 leading-none"
                >
                    {badge}
                </motion.span>
            )}

            <motion.div 
                className="absolute bottom-0 left-0 h-[2.5px] bg-brand-yellow"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />

            {active && (
                <motion.div 
                    layoutId="active-dot"
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-yellow rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
        </motion.a>
    );
};

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const lastScrollY = useRef(0);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 50);

            if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for active section indicator
    useEffect(() => {
        const sections = ['hero', 'manifesto', 'services', 'work'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const navItems = [
        { name: "MANIFESTO" },
        { name: "SERVICES" },
        { name: "WORK", badge: "05" }
    ];

    return (
        <>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ 
                    y: visible ? 0 : -110,
                    backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(255, 230, 0, 0.2)' : 'none'
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="fixed top-0 left-0 w-full z-[9999] h-[80px] md:h-[100px] flex items-center"
            >
                {/* Scrolled Texture Overlay */}
                <AnimatePresence>
                    {scrolled && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.03 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none z-[-1]"
                        >
                            <svg className="w-full h-full">
                                <filter id="navNoise">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#navNoise)" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="container mx-auto px-6 flex justify-between items-center relative">
                    {/* Left: Logo */}
                    <motion.div 
                        animate={{ scale: scrolled ? 0.9 : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <GlitchLogo />
                    </motion.div>

                    {/* Center: Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => (
                            <NavLink 
                                key={item.name} 
                                text={item.name} 
                                badge={item.badge} 
                                active={activeSection === item.name.toLowerCase()} 
                            />
                        ))}
                    </div>

                    {/* Right: CTA / Hamburger */}
                    <div className="flex items-center gap-6">
                        <motion.button 
                            whileHover={{ 
                                backgroundColor: "#FF1500", 
                                x: [0, -2, 2, -2, 2, 0],
                                transition: { x: { duration: 0.2, repeat: 3 } }
                            }}
                            className="relative px-6 py-2.5 bg-brand-yellow text-bg font-display text-lg tracking-[0.15em] uppercase hover-trigger cta-btn"
                        >
                            LET'S WORK
                            {/* Sparks around corners */}
                            <span className="spark spark-tl" />
                            <span className="spark spark-tr" />
                            <span className="spark spark-bl" />
                            <span className="spark spark-br" />
                        </motion.button>

                        {/* Hamburger */}
                        <button 
                            className="md:hidden flex flex-col gap-[5px] group"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className={`w-6 h-[2px] bg-brand-yellow transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px] !bg-brand-red' : ''}`} />
                            <span className={`w-6 h-[2px] bg-brand-yellow transition-all duration-300 group-hover:translate-x-1.5 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                            <span className={`w-6 h-[2px] bg-brand-yellow transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px] !bg-brand-red' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Bottom Caution Tape Line */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden pointer-events-none">
                    <div className="caution-strip w-[200%] h-full" />
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ clipPath: "circle(0% at 90% 5%)" }}
                        animate={{ clipPath: "circle(150% at 90% 5%)" }}
                        exit={{ clipPath: "circle(0% at 90% 5%)" }}
                        transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
                        className="fixed inset-0 bg-bg z-[9998] flex flex-col items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-8">
                            {navItems.map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={`#${item.name.toLowerCase()}`}
                                    initial={{ x: 60, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    onClick={() => setMobileOpen(false)}
                                    className="group flex flex-col items-center"
                                >
                                    <span className="font-mono text-[0.65rem] text-[#555] mb-1">0{i + 1}</span>
                                    <span className="font-display text-[15vw] leading-none text-brand-white group-hover:text-brand-yellow transition-all duration-300 group-hover:translate-x-4">
                                        {item.name}
                                    </span>
                                </motion.a>
                            ))}
                        </div>

                        <div className="absolute bottom-10 flex flex-col items-center gap-4">
                            <div className="flex gap-6 text-[#555] font-mono text-xs">
                                <a href="#" className="hover:text-brand-yellow">IG</a>
                                <a href="#" className="hover:text-brand-yellow">TW</a>
                                <a href="#" className="hover:text-brand-yellow">TT</a>
                                <a href="#" className="hover:text-brand-yellow">YT</a>
                            </div>
                            <div className="flex items-center gap-1 text-[#333] font-mono text-[0.65rem] tracking-widest uppercase">
                                STAY LOUD <Star size={10} fill="currentColor" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes animate-wiggle {
                    0%, 100% { transform: rotate(0); }
                    25% { transform: rotate(-2deg); }
                    75% { transform: rotate(2deg); }
                }
                .animate-wiggle {
                    animation: animate-wiggle 0.2s ease-in-out infinite;
                }

                .caution-strip {
                    background: repeating-linear-gradient(
                        45deg,
                        #FFE600,
                        #FFE600 4px,
                        #000 4px,
                        #000 8px
                    );
                    animation: caution-move 1s linear infinite;
                }
                @keyframes caution-move {
                    from { transform: translateX(0); }
                    to { transform: translateX(-16px); }
                }

                .cta-btn .spark {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #F5F5F0;
                    opacity: 0;
                    transition: all 0.3s;
                }
                .cta-btn:hover .spark {
                    opacity: 1;
                    scale: 2;
                }
                .spark-tl { top: -2px; left: -2px; }
                .spark-tr { top: -2px; right: -2px; }
                .spark-bl { bottom: -2px; left: -2px; }
                .spark-br { bottom: -2px; right: -2px; }
            `}</style>
        </>
    );
}

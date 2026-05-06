import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'motion/react';
import { Instagram, Twitter, Youtube, ArrowRight, Star, ArrowDown, Globe, Plus } from 'lucide-react';
import Navbar from './components/Navbar';

// --- UTILS ---
const splitText = (text: string) => text.split("");

// --- COMPONENTS ---

const GrainOverlay = () => (
  <div className="noise-overlay opacity-[0.03]">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const dotPos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    const moveMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleOver = (e: any) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('.hover-trigger')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleOver);
    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  useEffect(() => {
    let frameId: number;
    const lerp = () => {
      dotPos.current.x += (mousePos.x - dotPos.current.x) * 0.15;
      dotPos.current.y += (mousePos.y - dotPos.current.y) * 0.15;
      frameId = requestAnimationFrame(lerp);
    };
    lerp();
    return () => cancelAnimationFrame(frameId);
  }, [mousePos]);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-brand-yellow rounded-full pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: mousePos.x - 20,
          y: mousePos.y - 20,
          scale: isHovering ? 2 : 1,
          borderRadius: isHovering ? "40%" : "50%",
          width: isHovering ? 80 : 40,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 250, mass: 0.5 }}
      />
      <div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-brand-yellow rounded-full pointer-events-none z-[10001]"
        style={{
          transform: `translate3d(${dotPos.current.x - 3}px, ${dotPos.current.y - 3}px, 0)`
        }}
      />
    </>
  );
};

const Preloader = ({ onComplete }: { onComplete: () => void, key?: string }) => {
  const letters = ["L", "O", "U", "D"];
  const [glitchDone, setGlitchDone] = useState(false);

  useEffect(() => {
    // Wait for the last letter's flicker to finish + a small buffer
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="preloader"
      className="fixed inset-0 bg-bg z-[999] flex items-center justify-center overflow-hidden"
      exit={{ y: "-100vh" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex gap-4">
        {letters.map((letter, i) => (
          <GlitchLetter key={i} target={letter} delay={i * 0.2} />
        ))}
      </div>
    </motion.div>
  );
};

const GlitchLetter = ({ target, delay }: { target: string; delay: number, key?: any }) => {
  const [char, setChar] = useState("");
  const randomChars = "X$#%&*<>?/[]{}";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setChar(randomChars[Math.floor(Math.random() * randomChars.length)]);
      iteration++;
      if (iteration > 10 + delay * 10) {
        setChar(target);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [target, delay]);

  return (
    <span className="text-brand-yellow font-display text-[20vw] leading-none">
      {char}
    </span>
  );
};

const Marquee = ({ text, direction = "left", speed = 15, bg = "transparent", textColor = "brand-white" }: any) => {
  const [slowed, setSlowed] = useState(false);
  
  return (
    <div 
      className={`py-4 overflow-hidden whitespace-nowrap border-y border-brand-gray bg-${bg} flex items-center relative z-10 cursor-pointer`}
      onMouseEnter={() => setSlowed(true)}
      onMouseLeave={() => setSlowed(false)}
    >
      <motion.div
        className="flex shrink-0 min-w-full"
        animate={{ x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"] }}
        transition={{ 
          duration: slowed ? speed * 4 : speed, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <span className={`text-[4vw] font-display uppercase flex items-center gap-8 px-4 text-${textColor}`}>
          {Array(8).fill(text).join(" ")}
        </span>
      </motion.div>
      <motion.div
        className="flex shrink-0 min-w-full"
        animate={{ x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"] }}
        transition={{ 
          duration: slowed ? speed * 4 : speed, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <span className={`text-[4vw] font-display uppercase flex items-center gap-8 px-4 text-${textColor}`}>
          {Array(8).fill(text).join(" ")}
        </span>
      </motion.div>
    </div>
  );
};

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = target;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [isInView, target]);

  return (
    <motion.div
      ref={ref}
      className="text-bg font-display text-7xl sm:text-8xl md:text-[10vw] lg:text-[12vw] leading-none text-center"
      animate={isInView ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : {}}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {count}{suffix}
    </motion.div>
  );
};

const AnimatedText = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.3em]">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: delay + (wordIndex * 0.1) + (charIndex * 0.03), 
                duration: 0.6, 
                ease: "circOut" 
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

const SectionHeading = ({ children }: { children: string }) => {
  return (
    <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] leading-[0.9] mb-12">
      <AnimatedText text={children} />
    </h2>
  );
};

const ServiceRow = ({ num, title, desc, tags }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div 
      className={`group border-b border-brand-yellow/30 py-8 md:py-12 relative cursor-pointer overflow-hidden transition-all duration-300 ${isHovered ? 'bg-brand-yellow' : 'bg-transparent'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <div className={`container mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between relative z-10 transition-colors duration-300 ${isHovered ? 'text-bg' : 'text-brand-white'}`}>
         <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4 md:gap-8">
            <div className="flex items-center gap-4 md:gap-8">
              <span className="font-mono text-sm md:text-xl">{num}</span>
              <span className="text-4xl sm:text-6xl md:text-[8vw] leading-none uppercase font-display">{title}</span>
            </div>
            
            <div className="md:hidden">
               <motion.div
                 animate={{ rotate: isHovered ? 45 : 0 }}
                 transition={{ type: "spring", stiffness: 200 }}
               >
                 <Plus size={32} />
               </motion.div>
            </div>
         </div>
         
         <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={isHovered ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
            className="hidden md:block"
         >
            <ArrowRight size={80} strokeWidth={1} />
         </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="container mx-auto px-6 md:px-12 mt-6 relative z-10"
          >
            <div className="max-w-2xl text-bg pb-6">
                <p className="text-xl md:text-2xl mb-6 font-bold">{desc}</p>
                <div className="flex gap-3 flex-wrap">
                  {tags.map((t: string) => (
                    <span key={t} className="px-3 py-1 border-2 border-bg font-bold text-xs uppercase tracking-tighter">{t}</span>
                  ))}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MainContent = () => {
  const portfolioRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: portfolioRef,
    offset: ["start start", "end end"]
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  const springX = useSpring(xTransform, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
    >
      <Navbar />

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
        {/* Animated Watermark */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-[60vw] font-display text-brand-gray/30 opacity-50 select-none">LOUD</span>
        </motion.div>

        {/* Caution Tapes Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0 flex flex-col justify-center gap-10 rotate-[-15deg] scale-150">
           <div className="h-20 caution-tape w-full" />
           <div className="h-20 caution-tape w-full" />
           <div className="h-20 caution-tape w-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-7xl sm:text-8xl md:text-[12vw] lg:text-[18vw] leading-[0.8] mb-8 overflow-hidden flex flex-wrap justify-center font-display uppercase italic">
              <AnimatedText text="WE MAKE NOISE." delay={1} />
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-lg sm:text-xl md:text-3xl max-w-4xl mb-12 uppercase px-4"
            >
              Branding · Web · Social — Built Different.
            </motion.p>

            <motion.button 
               whileHover={{ scale: 1.1, rotate: [0, -1, 1, -1, 1, 0] }}
               className="px-12 py-6 bg-brand-yellow text-bg font-display text-4xl uppercase hover-trigger glitch-btn shadow-[8px_8px_0_0_#FF1500]"
            >
              LET'S WORK
            </motion.button>
          </div>
        </div>

        <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 "
        >
           <span className="font-mono text-xs uppercase tracking-widest">Scroll to Explore</span>
           <ArrowDown className="text-brand-yellow" />
        </motion.div>
      </section>

      {/* MARQUEE SECTION */}
      <div className="border-y-4 border-brand-yellow overflow-hidden py-2">
        <Marquee text="WE GO HARD ★ NO CAP ★ BUILT DIFFERENT ★ STAY LOUD ★" direction="left" speed={20} bg="brand-yellow" textColor="bg" />
        <Marquee text="BRANDING ✦ WEB DEV ✦ SOCIAL MEDIA ✦ CONTENT ✦ ADS ✦" direction="right" speed={25} />
      </div>

      {/* MANIFESTO */}
      <section id="manifesto" className="py-32 bg-bg px-6 relative overflow-hidden">
         {/* Skewed Divider */}
         <div className="absolute top-0 left-0 w-full h-32 bg-brand-gray -skew-y-3 -translate-y-1/2 z-0" />
         
         <div className="container mx-auto relative z-10 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
               <SectionHeading>WE DON'T DO BORING.</SectionHeading>
               <div className="space-y-6 text-3xl md:text-5xl font-display uppercase text-brand-muted">
                  <Typewriter text="No templates." />
                  <Typewriter text="No copy-paste." />
                  <Typewriter text="No mediocre." />
               </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="relative w-64 h-64 md:w-96 md:h-96"
                >
                   <div className="absolute inset-0 bg-brand-yellow mix-blend-difference translate-x-4 translate-y-4 rotate-12" />
                   <div className="absolute inset-0 bg-brand-red mix-blend-difference -translate-x-4 -translate-y-4 -rotate-6" />
                   <div className="absolute inset-4 border-4 border-brand-white" />
                </motion.div>
            </div>
         </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-bg">
        <div className="container mx-auto px-6 mb-12">
          <SectionHeading>WHAT WE DO</SectionHeading>
        </div>
        <ServiceRow 
          num="01" 
          title="BRANDING" 
          desc="We build identities that demand respect. From logo systems to brand strategy, we define your vibe."
          tags={["Visual Identity", "Strategy", "Tone of Voice", "Packaging"]}
        />
        <ServiceRow 
          num="02" 
          title="WEB DEV" 
          desc="Cutting edge digital experiences that load fast and look sick. We don't just build sites, we build stations."
          tags={["React", "Next.js", "Web3", "E-Commerce", "Motion"]}
        />
        <ServiceRow 
          num="03" 
          title="SOCIAL" 
          desc="Going viral isn't luck, it's a science. We handle content creation and community management."
          tags={["Content Strategy", "Video Production", "UGC", "Ads"]}
        />
      </section>

      {/* PORTFOLIO (Horizontal Sticky) */}
      <section id="work" ref={portfolioRef} className="relative h-[300vh] bg-bg">
         <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
            <div className="container mx-auto px-6 mb-12">
               <SectionHeading>THE WORK</SectionHeading>
            </div>
            <div className="flex items-center">
               <motion.div 
                  style={{ x: springX }}
                  className="flex gap-12 px-[10vw]"
               >
                  {[
                    { 
                      id: "01", 
                      name: "CHROME BABY", 
                      cat: "DESIGN", 
                      color: "from-brand-yellow/50",
                      image: "https://i.postimg.cc/tTfr6qnY/chrome-front.png",
                      link: "https://i.postimg.cc/PxN3Npx0/chrome-baby.png"
                    },
                    { 
                      id: "02", 
                      name: "GHAZI RESTAURANT", 
                      cat: "WEBSITE", 
                      color: "from-brand-red/50",
                      image: "https://i.postimg.cc/T1Dtqznj/ghazi.png",
                      link: "https://ghazikarachirestaurant.com/"
                    },
                    { 
                      id: "03", 
                      name: "GLOBAL FUSION", 
                      cat: "WEBSITE", 
                      color: "from-brand-gray/50",
                      image: "https://i.postimg.cc/kM6YmbL6/Capture.png",
                      link: "https://globalfusion-uk.com/"
                    },
                    { 
                      id: "04", 
                      name: "AURUM NOIR", 
                      cat: "DESIGN", 
                      color: "from-brand-muted/50",
                      image: "https://i.postimg.cc/tgBvXtX6/aunum-noir-front.png",
                      link: "https://i.postimg.cc/VspTrRXM/aurum-noir.png"
                    },
                    { 
                      id: "05", 
                      name: "OPEN HEART", 
                      cat: "DESIGN", 
                      color: "from-brand-yellow/80",
                      image: "https://i.postimg.cc/mZvX2rGy/openheart-front.png",
                      link: "https://i.postimg.cc/7PFsYLyW/openheart.png"
                    },
                  ].map((item) => (
                    <PortfolioCard key={item.id} {...item} />
                  ))}
               </motion.div>
            </div>
         </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-red py-32 flex items-center overflow-hidden">
         <div className="container mx-auto flex flex-wrap justify-between gap-12 px-6">
            <div>
              <Counter target={4} suffix="" />
              <p className="text-bg font-bold uppercase text-center mt-2">Projects</p>
            </div>
            <div>
              <Counter target={100} suffix="+" />
              <p className="text-bg font-bold uppercase text-center mt-2">Reach</p>
            </div>
            <div>
              <Counter target={2} suffix="" />
              <p className="text-bg font-bold uppercase text-center mt-2">Brands</p>
            </div>
            <div>
              <Counter target={0} suffix="" />
              <p className="text-bg font-bold uppercase text-center mt-2">Bad Vibes</p>
            </div>
         </div>
      </section>

      {/* PROCESS */}
      <section className="py-32 bg-bg px-6">
         <div className="container mx-auto">
            <SectionHeading>HOW WE MOVE</SectionHeading>
            <div className="mt-20 flex flex-col gap-24 relative">
               {/* Staircase steps */}
               <ProcessStep step="01" title="VIBE CHECK" desc="Discovery session to see if our energy aligns. No vibes, no work." offset={0} />
               <ProcessStep step="02" title="THE PLAN" desc="Strategy that cuts through the noise. We find the angle that wins." offset={25} />
               <ProcessStep step="03" title="WE BUILD" desc="Raw execution. Design and code that speaks for itself." offset={50} />
               <ProcessStep step="04" title="WE BLOW UP" desc="Launch day. We push the red button and scale the reach." offset={75} />
            </div>
         </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 border-t border-brand-gray bg-bg px-6">
         <div className="container mx-auto">
            <SectionHeading>THE WORD</SectionHeading>
            <div className="space-y-32 mt-20">
               {[
                 { quote: "LOUD STUDIO TURNED OUR VISION INTO A WEAPON. ABSOLUTELY LETHAL.", author: "Marcus Vane", company: "NEO-DREAD" },
                 { quote: "THEY DON'T JUST DESIGN, THEY DEFINE SUBCULTURES. CRAZY ENERGY.", author: "Sarah Li", company: "CHROME WAVE" },
                 { quote: "NO TEMPLATES, NO BS. JUST 100% AUTHENTIC RAW CREATIVE.", author: "DJ Ghost", company: "SOUND HAUS" }
               ].map((t, i) => (
                 <motion.div 
                    key={i}
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="border-l-[4px] md:border-l-[6px] border-brand-yellow pl-6 md:pl-12"
                 >
                    <p className="text-3xl sm:text-4xl md:text-7xl font-display uppercase italic mb-6">"{t.quote}"</p>
                    <p className="font-mono text-brand-muted uppercase text-xs md:text-sm">{t.author} — {t.company}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* WHY OUR PRICES ARE LOW */}
      <WhyPricing />

      {/* FOOTER */}
      <footer className="py-20 bg-bg border-t-2 border-brand-yellow relative overflow-hidden">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-yellow text-bg">
                 <Star fill="currentColor" size={24} />
              </div>
              <span className="font-display text-4xl tracking-tighter">LOUD.STUDIO</span>
           </div>
           <div className="flex gap-8">
              <motion.a whileHover={{ y: -5, color: "#FFE600" }} href="#" className="font-mono text-xs uppercase tracking-widest">Instagram</motion.a>
              <motion.a whileHover={{ y: -5, color: "#FFE600" }} href="#" className="font-mono text-xs uppercase tracking-widest">Twitter</motion.a>
              <motion.a whileHover={{ y: -5, color: "#FFE600" }} href="#" className="font-mono text-xs uppercase tracking-widest">Youtube</motion.a>
           </div>
           <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest text-center md:text-right">
              ©2026 LOUD CREATIVE STUDIO<br />ALL NOISE RESERVED.
           </div>
         </div>
         
         <div className="mt-20 border-t border-brand-gray overflow-hidden">
           <Marquee text="WE MAKE NOISE ★ WE MAKE NOISE ★ WE MAKE NOISE ★ WE MAKE NOISE ★" direction="right" speed={10} />
         </div>
      </footer>
    </motion.div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="relative min-h-screen selection:bg-brand-yellow selection:text-bg">
      <AnimatePresence>
        {loading && (
          <Preloader key="preloader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <GrainOverlay />
      <CustomCursor />

      {!loading && <MainContent />}
    </main>
  );
}

const Typewriter = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isInView, text]);

  return (
    <div ref={ref} className="overflow-hidden">
       {displayText}<span className="inline-block w-4 h-12 bg-brand-yellow ml-2 animate-pulse" />
    </div>
  );
};

const PortfolioCard = ({ id, name, cat, color, image, link }: any) => {
  return (
    <motion.div 
      whileHover={{ 
        rotateX: -10, 
        rotateY: 15, 
        scale: 1.02,
        boxShadow: "20px 20px 0px 0px #FFE600"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => link && window.open(link, '_blank')}
      className={`w-[280px] sm:w-[350px] md:w-[450px] aspect-[3/4] bg-brand-gray relative p-8 md:p-12 cursor-pointer flex flex-col justify-between overflow-hidden group perspective-1000`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} to-transparent opacity-30 transition-opacity group-hover:opacity-60`} />
      
      {image && (
        <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-bg/40 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
        </div>
      )}

      <div className="relative z-10">
        <span className="text-2xl md:text-4xl font-display text-brand-muted group-hover:text-brand-yellow transition-colors">{id}</span>
      </div>

      <div className="relative z-10">
        <h3 className="text-4xl md:text-6xl mb-2 group-hover:tracking-widest transition-all drop-shadow-2xl">{name}</h3>
        <span className="font-mono uppercase text-xs md:text-sm tracking-widest">{cat}</span>
      </div>

      <div className="absolute -bottom-10 -right-10 text-[15vw] font-display text-bg/10 select-none group-hover:text-bg transition-colors">
        {id}
      </div>
    </motion.div>
  );
};

const ProcessStep = ({ step, title, desc, offset }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
       ref={ref}
       initial={{ x: 100, opacity: 0 }}
       whileInView={{ x: 0, opacity: 1 }}
       viewport={{ once: true }}
       className="max-w-md group w-full lg:ml-[var(--desktop-offset)]"
       style={{ "--desktop-offset": `${offset}%` } as any}
    >
        <div className="flex items-start gap-4 md:gap-6">
           <span className="text-4xl md:text-6xl font-display text-brand-muted group-hover:text-brand-yellow transition-colors">{step}</span>
           <div>
              <h3 className="text-3xl md:text-5xl mb-4 group-hover:text-brand-white transition-colors">{title}</h3>
              <p className="text-brand-muted text-sm md:text-lg font-mono uppercase group-hover:text-brand-white transition-colors">{desc}</p>
           </div>
        </div>
        
        {/* Connection Line */}
        {step !== "04" && (
          <motion.div 
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute left-10 mt-6 w-1 h-32 border-l-2 border-dashed border-brand-yellow origin-top hidden lg:block" 
          />
        )}
    </motion.div>
  );
};

const CautionTape = () => (
  <div className="h-6 w-full caution-tape border-y border-black" />
);

const WhyPricing = () => {
  return (
    <section id="pricing" className="py-32 bg-bg relative overflow-hidden">
      <CautionTape />
      
      <div className="container mx-auto px-6 max-w-[1100px] mt-20">
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-mono text-brand-yellow text-xs tracking-[0.3em] mb-4"
        >
          // THE HONEST ANSWER
        </motion.p>

        <div className="mb-12">
          <h2 className="text-6xl md:text-8xl font-display leading-[0.8] mb-2 text-transparent" style={{ WebkitTextStroke: "1px white" }}>
            PREMIUM QUALITY.
          </h2>
          <h2 className="text-6xl md:text-8xl font-display leading-[0.8] text-brand-yellow">
            HONEST PRICING.
          </h2>
          <p className="font-mono text-brand-muted text-sm mt-8 max-w-xl leading-relaxed">
            Here's exactly why our rates are lower than Western agencies — and why that's good for you.
          </p>
        </div>

        {/* Main Explanation Card */}
        <motion.div 
          initial={{ x: -60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          viewport={{ once: true }}
          className="bg-brand-gray/30 border-l-4 border-brand-yellow p-8 md:p-12 mb-20 relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Globe size={120} className="text-brand-yellow" />
          </div>
          <div className="relative z-10 space-y-8">
            <p className="font-mono text-brand-white/80 text-[0.85rem] leading-[2] font-light">
              Loud Studio is proudly based in Pakistan. Our entire operation — talent, tools, technology, and overhead — runs on Pakistani Rupees (PKR). That's our cost base. That's our reality. And it gives you a significant advantage.
            </p>
            <p className="font-mono text-brand-white/80 text-[0.85rem] leading-[2] font-light">
              When you pay us in GBP, USD, or AED, that currency carries enormous purchasing power here. What costs a London agency £8,000 per month to deliver — salaries, office rent, software, management — costs us a fraction of that to operate at the same standard. We pass that difference directly to you.
            </p>
            <p className="font-mono text-brand-white/80 text-[0.85rem] leading-[2] font-light">
              Lower price does not mean lower quality. Our team produces the same strategies, the same content quality, and the same results-driven campaigns as any top-tier Western agency. The only difference is geography — and geography is not a measure of talent.
            </p>
            <p className="font-mono text-brand-white/80 text-[0.85rem] leading-[2] font-light">
              This is not a discount. This is not a compromise. This is an intelligent business model that benefits both sides — and it is exactly why our Western clients stay with us month after month.
            </p>
          </div>
        </motion.div>

        {/* Reason Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {[
            { 
              title: "GEOGRAPHY ≠ QUALITY", 
              body: "Talent has no postcode. Our strategists, designers, and content creators are trained to international standards. Where we sit doesn't define what we deliver.",
              icon: "🌍"
            },
            { 
              title: "YOUR CURRENCY. OUR COSTS.", 
              body: "The gap between GBP/USD and PKR means your marketing budget stretches further with us than with any local agency — without stretching your expectations.",
              icon: "💱"
            },
            { 
              title: "BUILT TO LAST.", 
              body: "We don't compete on price as a gimmick. We operate on a sustainable model that lets us attract serious clients, invest in our team, and deliver results.",
              icon: "🤝"
            }
          ].map((block, i) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group border-t-2 border-brand-yellow p-6 bg-brand-gray/10 hover:bg-brand-gray/20 transition-all hover:border-brand-red"
            >
              <span className="text-3xl mb-4 block filter grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">{block.icon}</span>
              <h4 className="font-display text-xl text-brand-yellow mb-4 tracking-wider uppercase group-hover:text-brand-red transition-colors">{block.title}</h4>
              <p className="font-mono text-brand-muted text-[0.78rem] leading-[2]">{block.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Quote */}
        <motion.div 
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
          viewport={{ once: true }}
          className="text-center py-20"
        >
          <div className="font-display text-3xl md:text-5xl lg:text-6xl mb-4 leading-none uppercase">
            YOUR POUND TRAVELS FURTHER HERE.
          </div>
          <div className="font-display text-3xl md:text-5xl lg:text-6xl text-brand-yellow leading-none uppercase">
            YOUR RESULTS DON'T SUFFER FOR IT.
          </div>
        </motion.div>
      </div>

      <div className="mt-20">
        <CautionTape />
      </div>
    </section>
  );
};


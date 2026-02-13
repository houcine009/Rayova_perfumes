import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/hooks/useSiteSettings";
import { useState, useEffect } from "react";

export function HeroSection() {
  const { data: heroSettings, isLoading } = useHeroSettings();
  const [isDark, setIsDark] = useState(true); // Default to dark as per Navbar logic

  useEffect(() => {
    // Sync with the manual dark mode logic from Navbar
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    // Observe class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const title = heroSettings?.title || "Rayova";
  const subtitle = heroSettings?.subtitle || "L'Art de la Parfumerie";
  // @ts-ignore - description might not be in the exact type but present in JSON
  const description = heroSettings?.description || "Découvrez l´essence de luxe";
  const ctaPrimary = heroSettings?.cta_primary || "Découvrir les parfums";
  const ctaSecondary = heroSettings?.cta_secondary || "Acheter maintenant";
  const videoUrl = heroSettings?.video_url;
  const imageUrl = heroSettings?.image_url;

  // Dynamic colors from settings
  const descriptionColor = isDark
    ? (heroSettings?.description_color_dark || '#f2f2f2')
    : (heroSettings?.description_color_light || '#1a1a1a');

  const isLoadingFinal = isLoading; // Placeholder for logic if we want to bypass

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Media */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* CSS Placeholder to fix LCP/White flash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] z-0" />

        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={imageUrl || undefined}
            className="w-full h-full object-cover relative z-10"
            key={videoUrl}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            // @ts-ignore
            fetchpriority="high"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : imageUrl ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover z-10"
            // @ts-ignore
            fetchpriority="high"
            loading="eager"
            width="1920"
            height="1080"
          />
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-hero-overlay/60 z-[1]" />

      {/* Animated Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(window.innerWidth < 768 ? 8 : 20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-luxury text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
          >
            {subtitle}
          </motion.p>

          {/* Main Title - SEO H1 */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-6"
          >
            <span className="text-gold-gradient">{title}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
            style={{ color: descriptionColor }}
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/boutique">
              <Button variant="hero" size="xl">
                {ctaPrimary}
              </Button>
            </Link>
            <Link to="/boutique">
              <Button variant="heroOutline" size="xl">
                {ctaSecondary}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] tracking-widest uppercase text-foreground/50">
              Défiler
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

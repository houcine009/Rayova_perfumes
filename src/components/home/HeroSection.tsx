import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/hooks/useSiteSettings";

export function HeroSection() {
  const { data: heroSettings, isLoading } = useHeroSettings();

  const title = heroSettings?.title || "Rayova";
  const subtitle = heroSettings?.subtitle || "L'Art de la Parfumerie";
  // @ts-ignore - description might not be in the exact type but present in JSON
  const description = heroSettings?.description || "Découvrez notre collection exclusive de parfums de luxe. Chaque fragrance est une invitation au voyage sensoriel.";
  const ctaPrimary = heroSettings?.cta_primary || "Découvrir les parfums";
  const ctaSecondary = heroSettings?.cta_secondary || "Acheter maintenant";
  const videoUrl = heroSettings?.video_url;
  const imageUrl = heroSettings?.image_url;

  if (isLoading) {
    return (
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 bg-hero-overlay z-10" />
      </section>
    );
  }

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={imageUrl || undefined}
            className="w-full h-full object-cover"
            key={videoUrl}
            // Adding `disablePictureInPicture` and `controlsList` can sometimes help with browser performance
            // by preventing certain UI elements or modes that might consume resources.
            // `disablePictureInPicture` prevents the video from being put into Picture-in-Picture mode.
            // `controlsList="nodownload nofullscreen noremoteplayback"` removes default controls like download, fullscreen, and remote playback.
            // While these are primarily UX/security features, removing unnecessary browser UI can sometimes
            // subtly improve rendering performance or prevent unexpected behavior that might be perceived as "lag".
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-hero-overlay/60 z-[1]" />

      {/* Animated Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
          >
            {subtitle}
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-6"
          >
            <span className="text-gold-gradient">{title}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
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
          transition={{ duration: 1, delay: 1.5 }}
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

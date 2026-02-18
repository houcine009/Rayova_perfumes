import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useRef, useState, useEffect } from "react";
import { getMediaUrl } from "@/lib/api";

interface Collection {
  slug: string;
  name: string;
  description: string;
  image?: string | null;
  href: string;
}

const defaultCollections: Collection[] = [
  {
    slug: "niche",
    name: "Niche",
    description: "Créations exclusives et avant-gardistes",
    image: null,
    href: "/categorie/niche",
  },
  {
    slug: "homme",
    name: "Homme",
    description: "Élégance masculine raffinée",
    image: null,
    href: "/categorie/homme",
  },
  {
    slug: "femme",
    name: "Femme",
    description: "Féminité et sophistication",
    image: null,
    href: "/categorie/femme",
  },
];

function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {visible ? (
        <video
          src={src}
          className={className}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}
    </div>
  );
}

export function CollectionsSection() {
  const { data: categories } = useCategories();

  const activeCategories = categories?.filter(c => c.is_active) || [];

  const getStorageUrl = (url: string | null | undefined) => {
    return getMediaUrl(url);
  };

  const collections = activeCategories.length > 0
    ? activeCategories.map(cat => ({
      slug: cat.slug,
      name: cat.name,
      description: cat.description || "Découvrez notre collection exclusive",
      image: cat.image_url ? getStorageUrl(cat.image_url) : null,
      href: `/categorie/${cat.slug}`,
    }))
    : defaultCollections;

  return (
    <section className="section-padding bg-background">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
            Nos Collections
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            Explorez l'Excellence
          </h2>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link
                to={collection.href}
                className="group block relative overflow-hidden aspect-[3/4]"
              >
                {/* Image or Video */}
                {collection.image?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <LazyVideo
                    src={collection.image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    width="400"
                    height="600"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  >
                    <h3 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium tracking-wide uppercase text-sm transition-all duration-300 group-hover:gap-4">
                      <span>Découvrir</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </motion.div>
                </div>

                {/* Border effect */}
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-all duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import collectionHomme from "@/assets/collection-homme.jpg";
import collectionFemme from "@/assets/collection-femme.jpg";
import collectionNiche from "@/assets/collection-niche.jpg";

const defaultCollections = [
  {
    slug: "niche",
    name: "Niche",
    description: "Créations exclusives et avant-gardistes",
    image: collectionNiche,
    href: "/categorie/niche",
  },
  {
    slug: "homme",
    name: "Homme",
    description: "Élégance masculine raffinée",
    image: collectionHomme,
    href: "/categorie/homme",
  },
  {
    slug: "femme",
    name: "Femme",
    description: "Féminité et sophistication",
    image: collectionFemme,
    href: "/categorie/femme",
  },
];

export function CollectionsSection() {
  const { data: categories } = useCategories();

  const collections = defaultCollections.map(defaultColl => {
    const category = categories?.find(c => c.slug === defaultColl.slug);
    if (category) {
      return {
        ...defaultColl,
        name: category.name,
        description: category.description || defaultColl.description,
        image: category.image_url || defaultColl.image,
      };
    }
    return defaultColl;
  });

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
                  <video
                    src={collection.image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${collection.image})` }}
                  />
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

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({
    featured: true,
    limit: 4
  });

  const featuredProducts = products || [];
  const [gridCols, setGridCols] = useState<1 | 2>(2);

  return (
    <section className="section-padding bg-card">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16"
        >
          <div>
            <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
              Dernières Nouveautés
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Nouveaux Parfums
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setGridCols(1)}
                className={`p-2 rounded-md transition-colors ${gridCols === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 rounded-md transition-colors ${gridCols === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <Link to="/boutique">
              <Button
                variant="luxuryOutline"
                className="group"
              >
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className={`grid ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] w-full bg-muted animate-pulse rounded-2xl" />
                <div className="space-y-2 px-2">
                  <div className="h-4 w-1/2 bg-muted animate-pulse mx-auto" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse mx-auto" />
                  <div className="h-4 w-1/4 bg-muted animate-pulse mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard {...product} priority={index < 2} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

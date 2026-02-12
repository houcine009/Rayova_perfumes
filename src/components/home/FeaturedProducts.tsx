import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts({
    featured: true,
    limit: 4
  });

  const featuredProducts = products || [];

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
          <Link to="/boutique">
            <Button
              variant="luxuryOutline"
              className="group"
            >
              <span>Voir tout</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 text-center">
                  <Skeleton className="h-4 w-1/4 mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-5 w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

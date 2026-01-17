import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import collectionHomme from "@/assets/collection-homme.jpg";
import collectionFemme from "@/assets/collection-femme.jpg";
import collectionNiche from "@/assets/collection-niche.jpg";

const categoryData: Record<string, { name: string; description: string; image: string }> = {
  niche: {
    name: "Collection Niche",
    description: "Créations exclusives et avant-gardistes pour les connaisseurs",
    image: collectionNiche,
  },
  homme: {
    name: "Pour Homme",
    description: "Élégance masculine raffinée et sophistiquée",
    image: collectionHomme,
  },
  femme: {
    name: "Pour Femme",
    description: "Féminité et sophistication en chaque note",
    image: collectionFemme,
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoryInfo = categoryData[slug || ""] || categoryData.niche;

  const { data: products, isLoading } = useProducts({
    category: slug === 'all' ? undefined : slug
  });

  const displayedProducts = products || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 lg:pt-24">
        {/* Category Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${categoryInfo.image})` }}
          />
          <div className="absolute inset-0 bg-background/70" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center"
          >
            <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
              Collection
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
              {categoryInfo.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {categoryInfo.description}
            </p>
          </motion.div>
        </section>

        {/* Products Grid */}
        <section className="section-padding">
          <div className="container-luxury">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <p className="text-muted-foreground">
                    {displayedProducts.length} produit{displayedProducts.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;

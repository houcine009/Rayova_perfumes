import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Loader2, LayoutGrid, List } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const { data: allCategories } = useCategories();
  const currentCategory = allCategories?.find(c => c.slug === slug);

  // Fallback to static data if not found or loading, but prefer database data
  const categoryInfo = currentCategory ? {
    name: currentCategory.name,
    description: currentCategory.description || "",
    image: currentCategory.image_url || categoryData[slug || "niche"]?.image || categoryData.niche.image
  } : (categoryData[slug || ""] || categoryData.niche);

  const isVideo = categoryInfo.image?.match(/\.(mp4|webm|ogg)$/i);

  const { data: products, isLoading } = useProducts({
    category: slug === 'all' ? undefined : slug
  });

  const displayedProducts = useMemo(() => products || [], [products]);
  const [gridCols, setGridCols] = useState<1 | 2>(2);

  useEffect(() => {
    // Noindex for categories to prioritize homepage
    const meta = document.createElement('meta');
    meta.name = "robots";
    meta.content = "noindex, follow";
    document.head.appendChild(meta);

    // Dynamic Canonical Link for each category
    const link = document.createElement('link');
    link.rel = "canonical";
    link.href = `https://rayovaparfums.com/categories/${slug}`;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(link);
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 lg:pt-24">
        {/* Category Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-muted/20">
          {!allCategories ? (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          ) : (
            <>
              {isVideo ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={categoryInfo.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              ) : (
                <img
                  src={categoryInfo.image}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  alt={categoryInfo.name}
                  style={{ objectPosition: 'center' }}
                />
              )}
            </>
          )}

          <div className="absolute inset-0 bg-background/60" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center"
          >
            {!allCategories ? (
              <div className="space-y-4">
                <div className="h-4 w-32 bg-muted animate-pulse mx-auto" />
                <div className="h-12 w-64 bg-muted animate-pulse mx-auto" />
                <div className="h-4 w-96 bg-muted animate-pulse mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
                  Collection
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 text-white">
                  {categoryInfo.name}
                </h1>
                <p className="text-white/80 text-lg max-w-xl mx-auto">
                  {categoryInfo.description}
                </p>
              </>
            )}
          </motion.div>
        </section>

        {/* Products Grid */}
        <section className="section-padding section-optimize">
          <div className="container-luxury">
            {isLoading ? (
              <div className={`grid ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
                {[...Array(8)].map((_, i) => (
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
              <>
                <div className="flex justify-between items-center mb-8">
                  <p className="text-muted-foreground">
                    {displayedProducts.length} produit{displayedProducts.length > 1 ? "s" : ""}
                  </p>
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
                </div>

                <div className={`grid ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
                  {displayedProducts.map((product, index) => (
                    <ProductCard key={product.id} {...product} priority={index < 4} contextCategory={categoryInfo.name} />
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

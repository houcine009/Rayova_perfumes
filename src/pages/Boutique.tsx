import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Loader2, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";

const Boutique = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [gridCols, setGridCols] = useState<1 | 2>(2);

  const { data: products, isLoading } = useProducts({
    search: searchQuery || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter.toLowerCase(),
    sort_by: sortBy === "price-asc" || sortBy === "price-desc" ? "price" : (sortBy === "name" ? "name" : "created_at"),
    sort_order: sortBy === "price-asc" ? "asc" : "desc",
  });

  // Since we might be doing frontend filtering/sorting too if API is limited
  const displayedProducts = products || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        {/* Page Header */}
        <section className="section-padding bg-card border-b border-border">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
                Notre Collection
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
                Boutique
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Découvrez notre sélection exclusive de parfums de luxe
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-background sticky top-20 lg:top-24 z-30">
          <div className="container-luxury">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un parfum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border rounded-none"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4 items-center w-full md:w-auto">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px] h-12 rounded-none bg-card border-border">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="Niche">Niche</SelectItem>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-12 rounded-none bg-card border-border">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="featured">En vedette</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="name">Nom A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="section-padding">
          <div className="container-luxury">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Chargement des parfums...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <p className="text-muted-foreground">
                    {displayedProducts.length} produit{displayedProducts.length > 1 ? "s" : ""} trouvé{displayedProducts.length > 1 ? "s" : ""}
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

                {displayedProducts.length > 0 ? (
                  <div className={`grid ${gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">
                      Aucun produit trouvé pour votre recherche.
                    </p>
                    <Button
                      variant="luxuryOutline"
                      className="mt-6"
                      onClick={() => {
                        setSearchQuery("");
                        setCategoryFilter("all");
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Boutique;

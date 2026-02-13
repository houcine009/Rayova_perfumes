import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { MediaDisplay } from "@/components/common/MediaDisplay";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  price: number | string;
  original_price?: number | string;
  image?: string;
  media?: Array<{ url: string; is_primary: boolean; mime_type?: string | null }>;
  category?: string;
  categories?: Array<{ name: string }>;
  is_featured?: boolean;
  priority?: boolean;
  rating?: number;
  reviews_count?: number;
  contextCategory?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  brand,
  price,
  original_price,
  image,
  category,
  categories,
  media,
  is_featured,
  priority = false,
  rating = 5,
  reviews_count = 0,
  contextCategory,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const numericPrice = Number(price);
  const numericOriginalPrice = original_price ? Number(original_price) : undefined;

  const primaryMedia = media?.find(m => m.is_primary) || media?.[0];
  const displayImage = primaryMedia?.url || image || '';
  const mediaMimeType = primaryMedia?.mime_type || null;
  const catNames = categories?.map(c => c.name.toLowerCase()) || [];
  const isMultiGender = catNames.includes('homme') && catNames.includes('femme');

  const rawCategory = isMultiGender ? "Unisexe" : (categories?.[0]?.name || category || '');
  const lowerCat = rawCategory.toLowerCase();

  // If viewing a specific category page (e.g. Homme), override "Unisexe/Niche" badge with the page context
  const displayCategory = contextCategory
    ? (lowerCat === 'unisexe' || lowerCat === 'unisex' || lowerCat === 'niche' ? contextCategory : rawCategory)
    : rawCategory;

  const discount = numericOriginalPrice
    ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      name,
      price: numericPrice,
      image: displayImage,
    });
    toast({
      title: "Ajouté au panier",
      description: `${name} a été ajouté à votre panier.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link to={`/produit/${slug}`} className="block">
        {/* Image/Video Container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-card mb-2 sm:mb-4 group-hover:shadow-2xl transition-shadow duration-500">
          <MediaDisplay
            src={displayImage}
            alt={name}
            className="transition-transform duration-700 group-hover:scale-105"
            priority={priority}
            autoPlay={true}
            onHoverPlay={false}
            isVideoHint={mediaMimeType?.startsWith('video/') || false}
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              variant="luxury"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
              onClick={handleAddToCart}
              aria-label={`Ajouter ${name} au panier`}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
            {is_featured && (
              <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-1.5 py-0.5 sm:px-3 sm:py-1">
                Nouveau
              </span>
            )}
            {discount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-1.5 py-0.5 sm:px-3 sm:py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <span className="bg-black/80 text-white text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase px-1.5 py-0.5 sm:px-3 sm:py-1.5 backdrop-blur-sm border border-white/10">
              {displayCategory}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center px-1">
          <p className="text-muted-foreground text-[10px] sm:text-xs tracking-[0.1em] uppercase mb-0.5 sm:mb-1 truncate">
            {brand}
          </p>
          <h3 className="font-display text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300 mb-1 sm:mb-2 line-clamp-2 leading-tight">
            {name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
            <span className="text-primary font-bold text-sm sm:text-lg">
              {numericPrice.toLocaleString("fr-MA")} MAD
            </span>
            {numericOriginalPrice && (
              <span className="text-muted-foreground line-through text-[11px] sm:text-sm">
                {numericOriginalPrice.toLocaleString("fr-MA")} MAD
              </span>
            )}
          </div>
          {reviews_count > 0 && (
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">({reviews_count})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}


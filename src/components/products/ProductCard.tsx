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
  media?: Array<{ url: string; is_primary: boolean }>;
  category?: string;
  categories?: Array<{ name: string }>;
  is_featured?: boolean;
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
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const numericPrice = Number(price);
  const numericOriginalPrice = original_price ? Number(original_price) : undefined;

  const displayImage = media?.find(m => m.is_primary)?.url || media?.[0]?.url || image || '';
  const displayCategory = categories?.[0]?.name || category || '';

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
        <div className="relative overflow-hidden aspect-[3/4] bg-card mb-4 group-hover:shadow-2xl transition-shadow duration-500">
          <MediaDisplay
            src={displayImage}
            alt={name}
            className="transition-transform duration-700 group-hover:scale-105"
            onHoverPlay
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              variant="luxury"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>

          </div>
          ...

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {is_featured && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase px-3 py-1">
                Vedette
              </span>
            )}
            {discount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold tracking-wider uppercase px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-background/80 text-foreground text-xs font-medium tracking-wider uppercase px-3 py-1 backdrop-blur-sm">
              {displayCategory}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <p className="text-muted-foreground text-xs tracking-wider uppercase mb-1">
            {brand}
          </p>
          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
            {name}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className="text-primary font-semibold text-lg">
              {numericPrice.toLocaleString("fr-MA")} MAD
            </span>
            {numericOriginalPrice && (
              <span className="text-muted-foreground line-through text-sm">
                {numericOriginalPrice.toLocaleString("fr-MA")} MAD
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

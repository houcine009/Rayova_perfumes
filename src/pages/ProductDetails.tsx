import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Heart,
    ChevronLeft,
    ChevronRight,
    Star,
    ShieldCheck,
    Truck,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { addItem } = useCart();
    const { data: product, isLoading, error } = useProduct(slug || '');

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 pt-48 pb-16 text-center">
                    <h1 className="text-3xl font-playfair font-bold mb-4">Produit non trouvé</h1>
                    <p className="text-muted-foreground mb-8">Nous n'avons pas pu trouver le parfum que vous recherchez.</p>
                    <Button onClick={() => navigate('/boutique')}>Retour à la boutique</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const images = product.media && product.media.length > 0
        ? product.media.map(m => m.url)
        : ['/placeholder.svg'];

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0],
            volume_ml: product.volume_ml,
        }, quantity);
        toast({
            title: "Ajouté au panier",
            description: `${product.name} a été ajouté à votre panier.`,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 lg:pt-32 pb-16">
                <div className="container-luxury">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Accueil</button>
                        <ChevronRight className="h-4 w-4" />
                        <button onClick={() => navigate('/boutique')} className="hover:text-primary transition-colors">Boutique</button>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square overflow-hidden bg-card rounded-2xl group">
                                <AnimatePresence mode="wait">
                                    {images[activeImage].match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i) ? (
                                        <motion.video
                                            key={activeImage}
                                            src={images[activeImage]}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="auto"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <motion.img
                                            key={activeImage}
                                            src={images[activeImage]}
                                            alt={product.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </AnimatePresence>

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative flex-shrink-0 w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent'
                                                }`}
                                        >
                                            {img.match(/\.(mp4|webm|mov|ogg|m4v)$/i) ? (
                                                <div className="w-full h-full relative">
                                                    <video
                                                        src={img}
                                                        muted
                                                        playsInline
                                                        preload="auto"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                            <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="space-y-2 mb-6">
                                <p className="text-primary font-medium tracking-widest uppercase text-sm">
                                    {product.brand || 'Rayova Luxury'}
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-foreground">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex text-primary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(Number(product.rating) || 5) ? 'fill-current' : 'text-muted-foreground opacity-50'}`} />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground">({Number(product.rating || 5).toFixed(1)}/5) Basé sur {product.reviews_count || 0} avis</span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-3xl font-bold text-primary">
                                    {product.price.toLocaleString('fr-MA')} MAD
                                </span>
                                {product.original_price && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {product.original_price.toLocaleString('fr-MA')} MAD
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Description</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {product.description || product.short_description || "Une fragrance d'exception qui incarne le luxe et le raffinement."}
                                    </p>
                                </div>

                                {(product.notes_top || product.notes_heart || product.notes_base) && (
                                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/50">
                                        {product.notes_top && (
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground uppercase tracking-tighter mb-1">Notes de Tête</p>
                                                <p className="text-sm font-medium">{product.notes_top}</p>
                                            </div>
                                        )}
                                        {product.notes_heart && (
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground uppercase tracking-tighter mb-1">Notes de Cœur</p>
                                                <p className="text-sm font-medium">{product.notes_heart}</p>
                                            </div>
                                        )}
                                        {product.notes_base && (
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground uppercase tracking-tighter mb-1">Notes de Fond</p>
                                                <p className="text-sm font-medium">{product.notes_base}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-border rounded-lg h-12">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="px-4 h-full hover:bg-muted transition-colors"
                                        >-</button>
                                        <span className="px-4 font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="px-4 h-full hover:bg-muted transition-colors"
                                        >+</button>
                                    </div>
                                    <Button
                                        className="flex-1 h-12 text-base font-semibold"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingBag className="mr-2 h-5 w-5" />
                                        Ajouter au panier
                                    </Button>
                                </div>
                            </div>

                            {/* Unique Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase">Livraison</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.price >= 500 ? 'Gratuite' : '35 MAD'}
                                            {product.price < 500 && ' (Gratuit dès 500 MAD)'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase">Paiement</p>
                                        <p className="text-xs text-muted-foreground">Sécurisé & Cash on Delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <RotateCcw className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase">Retours</p>
                                        <p className="text-xs text-muted-foreground">Sous 14 jours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetails;

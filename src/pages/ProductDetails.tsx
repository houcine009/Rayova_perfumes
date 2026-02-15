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
import { ReviewSection } from '@/components/products/ReviewSection';

const ProductDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { items, addItem } = useCart();
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

    const mimeTypes = product.media && product.media.length > 0
        ? product.media.map(m => m.mime_type || null)
        : [null];

    const isCurrentMediaVideo = (index: number) => {
        const mime = mimeTypes[index];
        if (mime && mime.startsWith('video/')) return true;
        const url = images[index];
        return url?.match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/i) ? true : false;
    };

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
                                    {isCurrentMediaVideo(activeImage) ? (
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
                                            {isCurrentMediaVideo(idx) ? (
                                                <div className="w-full h-full relative">
                                                    <video
                                                        src={img}
                                                        muted
                                                        playsInline
                                                        autoPlay
                                                        loop
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
                            </div>

                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {product.price.toLocaleString('fr-MA')} MAD
                                </span>
                                {product.original_price && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {product.original_price.toLocaleString('fr-MA')} MAD
                                    </span>
                                )}
                            </div>

                            {(product.reviews_count ?? 0) > 0 && (
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => {
                                            const rating = product.rating ?? 0;
                                            const fill = Math.min(1, Math.max(0, rating - (s - 1)));
                                            const pct = Math.round(fill * 100);
                                            const gradId = `star-grad-pd-${s}`;
                                            return (
                                                <svg key={s} className="h-5 w-5" viewBox="0 0 20 20">
                                                    <defs>
                                                        <linearGradient id={gradId}>
                                                            <stop offset={`${pct}%`} stopColor="#f59e0b" />
                                                            <stop offset={`${pct}%`} stopColor="#d1d5db" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path fill={`url(#${gradId})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            );
                                        })}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {Number(product.rating ?? 5).toFixed(1)} ({product.reviews_count} avis)
                                    </span>
                                </div>
                            )}

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
                                    <div className="flex-1 flex flex-col gap-3">
                                        <Button
                                            className="w-full h-12 text-base font-semibold"
                                            onClick={handleAddToCart}
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Ajouter au panier
                                        </Button>

                                        {items.some(item => item.id === product.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <Button
                                                    variant="heroOutline"
                                                    className="w-full h-12 text-base font-semibold border-primary/20 hover:border-primary/50 text-primary"
                                                    onClick={() => navigate('/panier')}
                                                >
                                                    Voir le panier
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
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
                                            {product.price >= 300 ? 'Gratuite' : '35 MAD'}
                                            {product.price < 300 && ' (Gratuit dès 300 MAD)'}
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

                {/* Reviews Section */}
                <ReviewSection productId={product.id} />
            </main >

            <Footer />
        </div >
    );
};

export default ProductDetails;

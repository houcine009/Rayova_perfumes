import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Loader2, ShoppingBag, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface TrackedOrder {
    order_number: string;
    status: string;
    total: number;
    subtotal: number;
    shipping_cost: number;
    created_at: string;
    updated_at: string;
    items: { product_name: string; product_price: number; quantity: number; subtotal: number }[];
}

const STATUS_STEPS = [
    { key: 'pending', label: 'En attente', icon: Clock, color: 'text-amber-400' },
    { key: 'confirmed', label: 'Confirmée', icon: CheckCircle2, color: 'text-blue-400' },
    { key: 'processing', label: 'En préparation', icon: Package, color: 'text-purple-400' },
    { key: 'shipped', label: 'Expédiée', icon: Truck, color: 'text-indigo-400' },
    { key: 'delivered', label: 'Livrée', icon: CheckCircle2, color: 'text-emerald-400' },
];

const SuiviCommande = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<TrackedOrder | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);

        try {
            const res = await api.post<{ data: TrackedOrder }>('/orders/track', {
                order_number: orderNumber.trim().toUpperCase(),
            });
            setOrder((res as any).data);
        } catch (err: any) {
            setError(err.message || 'Commande introuvable.');
        } finally {
            setLoading(false);
        }
    };

    const isCancelled = order?.status === 'cancelled';

    const getStepStatus = (stepIndex: number) => {
        if (!order) return 'upcoming';
        if (isCancelled) return 'cancelled';
        const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <MapPin className="h-4 w-4" />
                            Suivi de Commande
                        </div>
                        <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-foreground">
                            Suivez votre <span className="text-primary">commande</span>
                        </h1>
                        <p className="text-muted-foreground text-lg mb-10">
                            Entrez votre numéro de commande pour voir son statut en temps réel
                        </p>

                        {/* Search Form */}
                        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="RAY-XXXXXXXX-XXXX"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={loading || !orderNumber.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/25"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Rechercher'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Results */}
            <section className="container mx-auto px-4 pb-24">
                <AnimatePresence mode="wait">
                    {/* Error */}
                    {error && searched && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto text-center"
                        >
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8">
                                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">Commande introuvable</h3>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Order Found */}
                    {order && (
                        <motion.div
                            key="order"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            {/* Order Header */}
                            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Commande</p>
                                        <h2 className="text-2xl font-bold text-foreground font-mono">{order.order_number}</h2>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${isCancelled
                                        ? 'bg-destructive/10 text-destructive'
                                        : order.status === 'delivered'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-primary/10 text-primary'
                                        }`}>
                                        {isCancelled ? '❌ Annulée' :
                                            STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {/* Status Timeline */}
                            {!isCancelled ? (
                                <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
                                    <h3 className="text-lg font-semibold text-foreground mb-8">Progression</h3>
                                    <div className="relative">
                                        {/* Progress Line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/50 md:hidden" />
                                        <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-border/50" />

                                        <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-0">
                                            {STATUS_STEPS.map((step, i) => {
                                                const status = getStepStatus(i);
                                                const Icon = step.icon;
                                                return (
                                                    <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 relative md:flex-1">
                                                        <motion.div
                                                            initial={{ scale: 0.8 }}
                                                            animate={{ scale: status === 'current' ? 1.15 : 1 }}
                                                            className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${status === 'completed'
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : status === 'current'
                                                                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                                    : 'bg-card border-border/50 text-muted-foreground'
                                                                }`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                            {status === 'current' && (
                                                                <span className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-ping" />
                                                            )}
                                                        </motion.div>
                                                        <span className={`text-sm font-medium ${status === 'current' ? 'text-primary' :
                                                            status === 'completed' ? 'text-emerald-400' :
                                                                'text-muted-foreground'
                                                            }`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 md:p-8 text-center">
                                    <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                                    <p className="text-destructive font-semibold">Cette commande a été annulée.</p>
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Articles
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
                                            <div>
                                                <p className="font-medium text-foreground">{item.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {Number(item.product_price).toFixed(2)} MAD × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-foreground">{Number(item.subtotal).toFixed(2)} MAD</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Sous-total</span>
                                        <span>{Number(order.subtotal).toFixed(2)} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Livraison</span>
                                        <span>{Number(order.shipping_cost).toFixed(2)} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50">
                                        <span>Total</span>
                                        <span className="text-primary">{Number(order.total).toFixed(2)} MAD</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <Footer />
        </div>
    );
};

export default SuiviCommande;

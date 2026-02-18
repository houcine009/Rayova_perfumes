import { motion } from 'framer-motion';
import { ShoppingBag, Package, Truck, Calendar, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, getMediaUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return 'En attente';
        case 'processing': return 'En préparation';
        case 'shipped': return 'Expédiée';
        case 'delivered': return 'Livrée';
        case 'cancelled': return 'Annulée';
        default: return status;
    }
};

const ClientOrders = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading } = useQuery({
        queryKey: ['client-orders'],
        queryFn: async () => {
            const response = await api.get<any>('/orders');
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#0a0a0a_100%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />
            <div className="container mx-auto px-4 py-24 space-y-12 relative z-10">
                <div className="flex flex-col gap-8 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-muted-foreground hover:text-primary gap-2 p-0 h-auto hover:bg-transparent transition-all group"
                        >
                            <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retour</span>
                        </Button>
                    </motion.div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Badge variant="outline" className="text-primary border-primary/40 bg-primary/10 uppercase tracking-[0.2em] text-[10px] font-black px-4 py-1">Espace Privé</Badge>
                            <h1 className="text-5xl md:text-7xl font-playfair font-black text-white uppercase tracking-tighter leading-none">
                                Mes <span className="text-primary italic">Commandes</span>
                            </h1>
                            <p className="text-muted-foreground/80 font-medium text-lg max-w-xl border-l-2 border-primary/30 pl-6">
                                L'excellence de la parfumerie Rayova, <br className="hidden sm:block" />
                                retrouvez l'historique de vos acquisitions précieuses.
                            </p>
                        </div>
                    </div>
                </div>

                {!orders || orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 space-y-8 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-3xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-2xl shadow-primary/20 relative">
                            <ShoppingBag className="h-14 w-14" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold italic font-serif">Vous n'avez pas encore de commandes</h3>
                            <p className="text-muted-foreground mx-auto max-w-md">
                                Découvrez nos collections exclusives et trouvez votre prochaine signature olfactive.
                            </p>
                        </div>
                        <Button onClick={() => { window.location.href = '/boutique'; }} size="lg" className="rounded-full px-8 relative z-20">
                            Explorer la boutique
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid gap-8">
                        {orders.map((order: any, idx: number) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="overflow-hidden border-white/10 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] group bg-white/[0.03] backdrop-blur-3xl rounded-[32px] ring-1 ring-white/5">
                                    <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8 sm:p-10">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-2">Commande #{order.id.split('-')[0]}</p>
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={`px-6 py-2 rounded-full font-black uppercase tracking-[0.15em] text-[9px] border-none shadow-lg ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {/* Items Summary */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Articles</h4>
                                                <div className="space-y-3">
                                                    {order.items?.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-5">
                                                            <div className="h-14 w-14 rounded-xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors">
                                                                {item.product?.media?.[0]?.url && (
                                                                    <img
                                                                        src={getMediaUrl(item.product.media[0].url)}
                                                                        alt={item.product_name}
                                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-base font-bold text-white group-hover:text-primary transition-colors truncate">{item.product_name || 'Produit d\'exception'}</p>
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Qté: {item.quantity} × {Number(item.product_price).toLocaleString('fr-FR')} MAD</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Livraison</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Truck className="h-4 w-4 text-primary" />
                                                        <span className="font-bold">{order.shipping_city}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">
                                                        {order.shipping_address}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Totals */}
                                            <div className="flex flex-col justify-end items-end space-y-4">
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total de la commande</p>
                                                    <p className="text-5xl font-black text-primary font-serif italic tracking-tighter shadow-primary/20 drop-shadow-2xl">
                                                        {Number(order.total).toLocaleString('fr-FR')} <span className="text-2xl not-italic ml-1">MAD</span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">Paiement à la livraison (COD)</p>
                                                </div>
                                                <Button size="sm" variant="ghost" className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-colors pr-0" asChild>
                                                    <Link to={`/suivi-commande?order=${order.order_number}`}>
                                                        Suivre le colis <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ClientOrders;

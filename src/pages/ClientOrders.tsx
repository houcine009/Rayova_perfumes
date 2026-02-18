import { motion } from 'framer-motion';
import { ShoppingBag, Package, Truck, Calendar, ArrowRight, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

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
        <div className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto px-4 py-24 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[10px]">Espace Client</Badge>
                        <h1 className="text-4xl md:text-5xl font-playfair font-black text-foreground uppercase tracking-tight">
                            Mes Commandes
                        </h1>
                        <p className="text-muted-foreground">Retrouvez l'historique de vos achats chez Rayova Luxury.</p>
                    </div>
                </div>

                {!orders || orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 space-y-6 bg-white rounded-3xl border border-border/50 shadow-sm"
                    >
                        <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/40">
                            <ShoppingBag className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold italic font-serif">Vous n'avez pas encore de commandes</h3>
                            <p className="text-muted-foreground mx-auto max-w-md">
                                Découvrez nos collections exclusives et trouvez votre prochaine signature olfactive.
                            </p>
                        </div>
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link to="/boutique">Explorer la boutique</Link>
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
                                <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 group bg-white rounded-3xl">
                                    <CardHeader className="border-b border-border/50 bg-slate-50/50 p-6 sm:p-8">
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
                                            <Badge className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${getStatusColor(order.status)}`}>
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
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-slate-50 border border-border/30 flex-shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold truncate">{item.product_name || 'Produit'}</p>
                                                                <p className="text-[10px] text-muted-foreground">Qté: {item.quantity} × {Number(item.price).toFixed(2)} MAD</p>
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
                                                    <p className="text-3xl font-black text-primary font-serif italic tracking-tighter">
                                                        {Number(order.total).toLocaleString('fr-FR')} MAD
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">Paiement à la livraison (COD)</p>
                                                </div>
                                                <Button size="sm" variant="ghost" className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-colors pr-0" asChild>
                                                    <Link to={`/suivi-commande`}>
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
        </div>
    );
};

export default ClientOrders;

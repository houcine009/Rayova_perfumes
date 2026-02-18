import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    TrendingUp,
    TrendingDown,
    UserCheck,
    UserX,
    Phone,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getProductImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Fix double storage prefix issue
    if (url.startsWith('/storage/')) return url;
    if (url.startsWith('storage/')) return `/${url}`;
    return `/storage/${url}`;
};

const AdminInsights = () => {
    const [period, setPeriod] = useState<string>('month');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats-insights', period, selectedDate],
        queryFn: async () => {
            const date = new Date(selectedDate);
            const rowStats = await dashboardService.getStats(
                period,
                period === 'day' ? selectedDate : undefined,
                period === 'month' ? date.getMonth() + 1 : undefined,
                period === 'year' || period === 'month' ? date.getFullYear() : undefined
            );
            return rowStats.data;
        },
    });

    const { data: userStats, isLoading: userStatsLoading } = useQuery({
        queryKey: ['admin-user-stats'],
        queryFn: async () => {
            const response = await api.get<any>('/admin/users/stats');
            return response.data;
        },
    });

    const { data: reviewStats, isLoading: reviewStatsLoading } = useQuery({
        queryKey: ['admin-review-stats'],
        queryFn: async () => {
            const response = await api.get<any>('/admin/reviews/stats');
            return response.data;
        },
    });

    const handlePrev = () => {
        const d = new Date(selectedDate);
        if (period === 'day') d.setDate(d.getDate() - 1);
        else if (period === 'month') d.setMonth(d.getMonth() - 1);
        else if (period === 'year') d.setFullYear(d.getFullYear() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleNext = () => {
        const d = new Date(selectedDate);
        if (period === 'day') d.setDate(d.getDate() + 1);
        else if (period === 'month') d.setMonth(d.getMonth() + 1);
        else if (period === 'year') d.setFullYear(d.getFullYear() + 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const now = new Date();
    const isFuture = () => {
        const d = new Date(selectedDate);
        if (period === 'day') return d >= new Date(now.setHours(0, 0, 0, 0));
        if (period === 'month') return d.getMonth() >= now.getMonth() && d.getFullYear() >= now.getFullYear();
        if (period === 'year') return d.getFullYear() >= now.getFullYear();
        return false;
    };

    const getLabel = () => {
        const d = new Date(selectedDate);
        if (period === 'day') {
            return d.toDateString() === new Date().toDateString()
                ? "Aujourd'hui"
                : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        if (period === 'month') {
            return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        }
        if (period === 'year') {
            return d.getFullYear().toString();
        }
        return "";
    };

    const isPageLoading = statsLoading || userStatsLoading || reviewStatsLoading;

    if (isPageLoading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
                </div>
                <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary ring-1 ring-primary/30 shadow-2xl shadow-primary/20">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-playfair font-black text-foreground uppercase tracking-tight">
                            Strategic Intelligence
                        </h2>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Analyse décisionnelle approfondie du catalogue
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[140px] sm:w-[160px] bg-card/50 backdrop-blur-sm border-border/50 rounded-xl font-bold text-xs uppercase tracking-wider">
                            <SelectValue placeholder="Période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Aujourd'hui</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                            <SelectItem value="year">Cette année</SelectItem>
                            <SelectItem value="all">Tout le temps</SelectItem>
                        </SelectContent>
                    </Select>

                    {['day', 'month', 'year'].includes(period) && (
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-sm">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-[10px] font-black px-2 min-w-[100px] sm:min-w-[120px] text-center capitalize tracking-tighter text-foreground/80">
                                {getLabel()}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={isFuture()} onClick={handleNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategic Tabs */}
            <div className="relative group rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-background p-1">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

                <div className="relative bg-background/60 backdrop-blur-3xl rounded-[22px] p-4 sm:p-8">
                    <Tabs defaultValue="products" className="w-full">
                        <div className="overflow-x-auto pb-4 mb-4 -mx-2 px-2 scrollbar-hide">
                            <TabsList className="flex w-fit lg:grid lg:w-full lg:grid-cols-4 max-w-[800px] bg-muted/40 p-1 border border-border/50 rounded-xl">
                                <TabsTrigger value="products" className="whitespace-nowrap gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-4 sm:px-6">
                                    <Package className="h-4 w-4" />
                                    Performances Produits
                                </TabsTrigger>
                                <TabsTrigger value="clients" className="whitespace-nowrap gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-4 sm:px-6">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Profils Clients
                                </TabsTrigger>
                                <TabsTrigger value="reviews" className="whitespace-nowrap gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-4 sm:px-6">
                                    <Star className="h-4 w-4" />
                                    Avis Clients
                                </TabsTrigger>
                                <TabsTrigger value="growth" className="whitespace-nowrap gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-4 sm:px-6">
                                    <TrendingUp className="h-4 w-4" />
                                    Croissance
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="products" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* BEST SELLERS */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-emerald-500/10">
                                    <CardHeader className="bg-emerald-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                                            <TrendingUp className="h-6 w-6" />
                                            MEILLEURES VENTES (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {stats?.super_admin?.best_sellers?.map((product: any, idx: number) => (
                                                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-emerald-500/5 transition-all group">
                                                    <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border border-border/30 bg-muted">
                                                        {product.media?.[0] ? (
                                                            <img
                                                                src={getProductImageUrl(product.media[0].url)}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover group-hover:scale-110 transition-all duration-500"
                                                            />
                                                        ) : <Package className="h-6 w-6 m-auto text-muted-foreground/30" />}
                                                        <div className="absolute top-0 left-0 bg-emerald-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded-br-lg shadow">
                                                            #{idx + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{product.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{Number(product.price).toFixed(2)} MAD</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-emerald-500 leading-none">{product.sales_count}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mt-1">Livrés</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* WORST SELLERS */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-red-500/10">
                                    <CardHeader className="bg-red-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <TrendingDown className="h-6 w-6" />
                                            Basse Rotation (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {stats?.super_admin?.worst_sellers?.map((product: any) => (
                                                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-red-500/5 transition-all group">
                                                    <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border border-border/30 bg-muted grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                                        {product.media?.[0] ? (
                                                            <img
                                                                src={getProductImageUrl(product.media[0].url)}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : <Package className="h-6 w-6 m-auto text-muted-foreground/30" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-foreground truncate">{product.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`h-1.5 w-1.5 rounded-full ${product.stock_quantity < 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                                            <p className="text-[10px] text-muted-foreground font-bold">Stock Actuel: {product.stock_quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-red-500 leading-none">{product.sales_count}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mt-1">Ventes</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="clients" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* BEST CLIENTS */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-blue-500/10">
                                    <CardHeader className="bg-blue-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                            <UserCheck className="h-6 w-6" />
                                            CLIENTS FIDÈLES (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {stats?.super_admin?.best_clients?.map((client: any) => (
                                                <div key={client.shipping_phone} className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 font-black border border-blue-500/30">
                                                            {client.customer_name?.charAt(0) || 'C'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{client.customer_name || 'Client Inconnu'}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">{client.shipping_phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-black text-blue-600">{Number(client.total_spent).toLocaleString('fr-FR')} MAD</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase">{client.orders_count} commandes livrées</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* CANCELLED CLIENTS */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-amber-500/10">
                                    <CardHeader className="bg-amber-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                                            <UserX className="h-6 w-6" />
                                            RÉSILIATIONS & ANNULATIONS (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {stats?.super_admin?.cancelled_clients?.map((client: any) => (
                                                <div key={client.shipping_phone} className="flex items-center justify-between p-4 hover:bg-amber-500/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-black border border-amber-500/30">
                                                            {client.customer_name?.charAt(0) || 'C'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{client.customer_name || 'Client Inconnu'}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">{client.shipping_phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-amber-600 leading-none">{client.cancellations_count}</p>
                                                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Annulations</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full bg-amber-500/20 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                                                            <a href={`tel:${client.shipping_phone}`}>
                                                                <Phone className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* BEST RATED */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-amber-500/10">
                                    <CardHeader className="bg-amber-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                                            <Star className="h-6 w-6 fill-amber-500/20" />
                                            MEILLEURES NOTES (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {reviewStats?.best_rated?.map((item: any) => (
                                                <div key={item.product_id} className="flex items-center justify-between p-4 hover:bg-amber-500/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border/30">
                                                            {item.product?.media?.[0] ? (
                                                                <img
                                                                    src={getProductImageUrl(item.product.media[0].url)}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : <Package className="h-5 w-5 m-auto text-muted-foreground/30" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground truncate max-w-[150px]">{item.product?.name || 'Produit Inconnu'}</p>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(item.avg_rating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-amber-500Leading-none">{Number(item.avg_rating).toFixed(1)}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{item.reviews_count} avis</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* MOST COMMENTED */}
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-purple-500/10">
                                    <CardHeader className="bg-purple-500/5 border-b border-border/50 py-4">
                                        <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                                            <LayoutDashboard className="h-6 w-6" />
                                            LES PLUS COMMENTÉS (TOP 20)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[700px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                                            {reviewStats?.most_commented?.map((item: any) => (
                                                <div key={item.product_id} className="flex items-center justify-between p-4 hover:bg-purple-500/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border/30">
                                                            {item.product?.media?.[0] ? (
                                                                <img
                                                                    src={getProductImageUrl(item.product.media[0].url)}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : <Package className="h-5 w-5 m-auto text-muted-foreground/30" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground truncate max-w-[150px]">{item.product?.name || 'Produit Inconnu'}</p>
                                                            <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{item.product?.brand || 'Rayova'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-purple-500 leading-none">{item.reviews_count}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Contributions</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="growth" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Comptes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-4xl font-black text-primary font-serif italic">{userStats?.total || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Inscriptions Aujourd'hui</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-4xl font-black text-primary font-serif italic">{userStats?.today || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/50 bg-card/10 backdrop-blur-md">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ce Mois</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-4xl font-black text-primary font-serif italic">{userStats?.this_month || 0}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3 text-primary">
                                        <TrendingUp className="h-6 w-6" />
                                        CROISSANCE DES COMPTES (DERNIERS 30 JOURS)
                                    </CardTitle>
                                    <CardDescription>Évolution journalière des nouvelles créations de comptes clients.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-[300px] w-full flex items-end justify-between gap-1 sm:gap-2 pt-10 px-2 lg:px-10">
                                        {userStats?.trend?.map((day: any) => {
                                            const maxCount = Math.max(...userStats.trend.map((d: any) => d.count), 1);
                                            const height = day.count > 0 ? Math.max((day.count / maxCount) * 100, 8) : 3;
                                            return (
                                                <div key={day.date} className="group relative flex-1">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${height}%` }}
                                                        transition={{ duration: 0.5, delay: 0.01 * userStats.trend.indexOf(day) }}
                                                        className={`w-full ${day.count > 0 ? 'bg-primary/40 hover:bg-primary' : 'bg-primary/10 hover:bg-primary/20'} transition-all rounded-t-lg relative`}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {day.count}
                                                        </div>
                                                    </motion.div>
                                                    <div className="mt-2 text-[8px] sm:text-[10px] text-muted-foreground font-medium -rotate-45 sm:rotate-0 origin-right sm:text-center truncate w-full">
                                                        {new Date(day.date).getDate()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminInsights;

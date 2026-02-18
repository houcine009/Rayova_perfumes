import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  UserCheck,
  UserX,
  Phone,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
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
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  processing: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  delivered: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

const AdminHome = () => {
  const { isSuperAdmin } = useAuth();
  const [period, setPeriod] = useState<string>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', period, selectedDate],
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

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: async () => {
      const response = await dashboardService.getRecentOrders();
      return response.data;
    },
  });

  const mainStats = [
    {
      title: 'Produits actifs',
      value: stats?.products.active || 0,
      subValue: `${stats?.products.total || 0} total`,
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10',
      link: '/admin/produits',
      show: isSuperAdmin,
    },
    {
      title: 'Commandes',
      value: stats?.orders.total || 0,
      subValue: `${stats?.orders.today || 0} aujourd'hui`,
      icon: ShoppingCart,
      color: 'text-emerald-500',
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
      link: '/admin/commandes',
      show: true,
    },
    {
      title: 'Ventes (Net)',
      value: `${Number(stats?.orders.revenue || 0).toLocaleString('fr-FR')} MAD`,
      subValue: 'Produits uniquement',
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-gradient-to-br from-primary/20 to-primary/10',
      trend: '+12%',
      trendUp: true,
      show: isSuperAdmin,
    },
    {
      title: 'Livraison (Total)',
      value: `${Number(stats?.orders.total_shipping || 0).toLocaleString('fr-FR')} MAD`,
      subValue: 'Frais collectés',
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
      show: isSuperAdmin,
    },
    {
      title: 'Commandes Livrées',
      value: stats?.orders.completed || 0,
      subValue: 'Total livraisons',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
      show: true,
    },
  ].filter(s => s.show);

  const orderStats = [
    { label: 'En attente', value: stats?.orders.pending || 0, color: 'bg-amber-500' },
    { label: 'En cours', value: stats?.orders.processing || 0, color: 'bg-purple-500' },
    { label: 'Livrées', value: stats?.orders.completed || 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 🚀 SUPER ADMIN STRATEGIC ANALYSIS SECTION (HIGH PRIORITY) */}
      {isSuperAdmin && stats?.super_admin && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-1"
        >
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

          <div className="relative bg-background/60 backdrop-blur-3xl rounded-[22px] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
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
                    Analyse en temps réel du catalogue et de la clientèle
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit h-fit px-4 py-1.5 border-primary/30 text-primary font-mono text-[10px] uppercase tracking-widest bg-primary/5">
                Super Admin Access Only
              </Badge>
            </div>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-muted/40 p-1 border border-border/50">
                <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                  <Package className="h-4 w-4" />
                  Performances Produits
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                  <Users className="h-4 w-4" />
                  Profils Clients
                </TabsTrigger>
              </TabsList>

              {/* 📊 TAB 1: PRODUCT PERFORMANCE (ALL 20 BEST/WORST) */}
              <TabsContent value="products" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* BEST SELLERS (TOP 20) */}
                  <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-emerald-500/10">
                    <CardHeader className="bg-emerald-500/5 border-b border-border/50 py-4">
                      <CardTitle className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                        MEILLEURES VENTES (TOP 20)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                        {stats.super_admin.best_sellers.map((product: any, idx: number) => (
                          <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-emerald-500/5 transition-all group">
                            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border border-border/30 bg-muted">
                              {product.media?.[0] ? (
                                <img
                                  src={product.media[0].url.startsWith('http') ? product.media[0].url : `/storage/${product.media[0].url}`}
                                  alt={product.name}
                                  className="h-full w-full object-cover group-hover:scale-110 transition-all duration-500"
                                />
                              ) : <Package className="h-6 w-6 m-auto text-muted-foreground/30" />}
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
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

                  {/* WORST SELLERS (TOP 20) */}
                  <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-red-500/10">
                    <CardHeader className="bg-red-500/5 border-b border-border/50 py-4">
                      <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <TrendingDown className="h-6 w-6" />
                        POINTS MORTS (TOP 20)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                        {stats.super_admin.worst_sellers.map((product: any, idx: number) => (
                          <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-red-500/5 transition-all group">
                            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border border-border/30 bg-muted grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                              {product.media?.[0] ? (
                                <img
                                  src={product.media[0].url.startsWith('http') ? product.media[0].url : `/storage/${product.media[0].url}`}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : <Package className="h-6 w-6 m-auto text-muted-foreground/30" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${product.stock_quantity < 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                <p className="text-[10px] text-muted-foreground">Stock: {product.stock_quantity}</p>
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

              {/* 👥 TAB 2: CLIENT INSIGHTS (ALL 20 BEST/CANCELLED) */}
              <TabsContent value="clients" className="mt-0 space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* TOP CLIENTS (TOP 20) */}
                  <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-blue-500/10">
                    <CardHeader className="bg-blue-500/5 border-b border-border/50 py-4">
                      <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                        <UserCheck className="h-6 w-6" />
                        CLIENTS FIDÈLES (TOP 20)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                        {stats.super_admin.best_clients.map((client: any, idx: number) => (
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
                              <p className="text-base font-black text-blue-600">{Number(client.total_spent).toLocaleString('fr-FR')} <span className="text-[10px] font-normal">MAD</span></p>
                              <p className="text-[9px] text-muted-foreground uppercase">{client.orders_count} commandes livrées</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AT-RISK CLIENTS (TOP 20) */}
                  <Card className="border-border/50 bg-card/10 backdrop-blur-md overflow-hidden ring-1 ring-amber-500/10">
                    <CardHeader className="bg-amber-500/5 border-b border-border/50 py-4">
                      <CardTitle className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                        <UserX className="h-6 w-6" />
                        CLIENTS À RISQUE (ANNULATIONS 20)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                        {stats.super_admin.cancelled_clients.map((client: any, idx: number) => (
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
            </Tabs>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-playfair font-black text-foreground tracking-tight"
              >
                Tableau de bord
              </motion.h1>
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Rayova Luxury Admin Panel</p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:items-end gap-3"
        >
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

          <Button asChild className="w-full sm:w-auto shadow-xl hover:shadow-primary/20 transition-all rounded-xl border border-primary/20">
            <Link to="/admin/produits">
              <Package className="mr-2 h-4 w-4" />
              NOUVEAU PRODUIT
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm h-full rounded-2xl ring-1 ring-border/5 border-none">
              <div className={`absolute inset-0 ${stat.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <CardContent className="relative p-5 flex flex-col h-full justify-between gap-6">
                {statsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${stat.bg} ring-1 ring-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      {stat.trend && (
                        <span className="flex items-center text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">{stat.title}</p>
                      <p className="text-2xl font-black text-foreground tracking-tight break-words">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-bold italic opacity-60 uppercase">{stat.subValue}</p>
                    </div>
                  </>
                )}
                {stat.link && <Link to={stat.link} className="absolute inset-0 z-10" />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rest of the dashboard... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Analytics */}
        <Card className="rounded-3xl border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
              <BarChart3 className="h-5 w-5 text-primary" />
              LOGISTIQUE
            </CardTitle>
            <CardDescription className="uppercase text-[9px] tracking-widest font-black">Répartition du flux</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {orderStats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-tighter">{stat.label}</span>
                    <span className="text-foreground">{stat.value}</span>
                  </div>
                  <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden p-[2px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.value / (stats?.orders.total || 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${stat.color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border/30 flex items-center justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Période</p>
              <p className="text-lg font-black text-foreground">{stats?.orders.total || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Operations */}
        <Card className="lg:col-span-2 rounded-3xl border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight uppercase">
                <Clock className="h-5 w-5 text-primary" />
                Opérations Récentes
              </CardTitle>
              <CardDescription className="uppercase text-[9px] tracking-widest font-black">Flux de commandes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-lg text-[10px] font-black uppercase border border-border/50 hover:bg-primary hover:text-white transition-all">
              <Link to="/admin/commandes text-white">Archives</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : recentOrders?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground/30 font-black italic">No activity detected</div>
            ) : (
              <div className="divide-y divide-border/20">
                {recentOrders?.slice(0, 6).map((order, index) => (
                  <motion.div
                    key={order.id}
                    className="flex items-center justify-between p-4 px-6 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-inner ${statusColors[order.status] || 'bg-muted'}`}>
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{order.order_number}</p>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-foreground">{Number(order.total).toLocaleString()} MAD</p>
                      <Badge variant="outline" className={`mt-1 h-5 px-3 uppercase text-[8px] font-black border-none shadow-sm ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;

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
          <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight uppercase">
                <Clock className="h-5 w-5 text-primary" />
                Opérations Récentes
              </CardTitle>
              <CardDescription className="uppercase text-[9px] tracking-widest font-black">Flux de commandes</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-lg text-[10px] font-black uppercase border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5">
              <Link to="/admin/commandes">Archives</Link>
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

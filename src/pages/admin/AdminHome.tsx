import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const response = await dashboardService.getStats(period);
      return response.data;
    },
  });

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-playfair font-bold text-foreground"
          >
            Tableau de bord
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Bienvenue dans votre espace d'administration Rayova
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-card/50 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout le temps</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link to="/admin/produits">
              <Package className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm h-full">
              <div className={`absolute inset-0 ${stat.bg} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="relative p-4 sm:p-6 flex flex-col h-full justify-between min-h-[120px] sm:min-h-[140px]">
                {statsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      {stat.trend && (
                        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl sm:text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 font-medium">{stat.subValue}</p>
                    </div>
                  </>
                )}
                {stat.link && (
                  <Link
                    to={stat.link}
                    className="absolute inset-0 z-10"
                    aria-label={`Voir ${stat.title}`}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Order Pipeline & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Pipeline des commandes
              </CardTitle>
              <CardDescription>
                Répartition par statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderStats.map((stat) => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium text-foreground">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / (stats?.orders.total || 1)) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={`h-full ${stat.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ce mois</span>
                  <span className="font-bold text-foreground">{stats?.orders.this_month || 0} commandes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Commandes récentes
                </CardTitle>
                <CardDescription>
                  Les 10 dernières commandes
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/commandes">Voir tout</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders?.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune commande pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders?.slice(0, 5).map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${statusColors[order.status] || 'bg-muted'}`}>
                          {order.status === 'delivered' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : order.status === 'pending' ? (
                            <Clock className="h-4 w-4" />
                          ) : order.status === 'cancelled' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <ShoppingCart className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {Number(order.total).toLocaleString('fr-FR')} MAD
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-none">
          <CardContent className="py-4 sm:py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{stats?.products.featured || 0}</p>
                <p className="text-sm text-muted-foreground">Produits vedettes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{stats?.categories.active || 0}</p>
                <p className="text-sm text-muted-foreground">Catégories actives</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{stats?.users.total || 0}</p>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{stats?.products.low_stock || 0}</p>
                <p className="text-sm text-muted-foreground">Stock faible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminHome;

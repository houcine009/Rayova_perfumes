import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Search,
    Trash2,
    Download,
    UserCheck,
    UserMinus,
    Users,
    Calendar,
    AlertCircle,
    Loader2,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subscriber {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at: string | null;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    today: number;
    this_month: number;
}

const AdminNewsletter = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [subsRes, statsRes] = await Promise.all([
                fetch('/api/admin/newsletter', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/admin/newsletter/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (subsRes.ok && statsRes.ok) {
                const subsData = await subsRes.json();
                const statsData = await statsRes.json();
                setSubscribers(subsData.data || []);
                setStats(statsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/newsletter/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Abonné supprimé');
                fetchData();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        }
    };

    const exportEmails = () => {
        const emails = subscribers.map(s => s.email).join('\n');
        const blob = new Blob([emails], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `newsletter-emails-${format(new Date(), 'dd-MM-yyyy')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredSubscribers = subscribers.filter(sub => {
        const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ? true : (filter === 'active' ? sub.is_active : !sub.is_active);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Newsletter</h1>
                    <p className="text-muted-foreground mt-1 text-sm lg:text-base">Gérez vos abonnés et exportez vos listes d'emails.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchData} disabled={loading} className="rounded-xl">
                        <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button variant="luxury" onClick={exportEmails} className="rounded-xl">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter les emails
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard
                    title="Total Abonnés"
                    value={stats?.total || 0}
                    icon={Users}
                    description="Inscriptions totales"
                />
                <StatsCard
                    title="Actifs"
                    value={stats?.active || 0}
                    icon={UserCheck}
                    description="Abonnements valides"
                    color="text-emerald-500"
                />
                <StatsCard
                    title="Aujourd'hui"
                    value={stats?.today || 0}
                    icon={Calendar}
                    description="Nouveaux abonnés"
                    color="text-blue-500"
                />
                <StatsCard
                    title="Ce mois"
                    value={stats?.this_month || 0}
                    icon={Mail}
                    description="Inscriptions mensuelles"
                    color="text-primary"
                />
            </div>

            {/* Main Content */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl shadow-xl">
                <CardHeader className="border-b border-border/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Liste des abonnés
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    className="bg-background/50 border border-border/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-32"
                                >
                                    <option value="all">Tous</option>
                                    <option value="active">Actifs</option>
                                    <option value="inactive">Inactifs</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-[300px] py-4">Email</TableHead>
                                    <TableHead className="py-4">Statut</TableHead>
                                    <TableHead className="py-4">Date d'inscription</TableHead>
                                    <TableHead className="text-right py-4 pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-muted-foreground">Chargement des abonnés...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSubscribers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                                                <span className="text-muted-foreground">Aucun abonné trouvé</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubscribers.map((subscriber) => (
                                        <TableRow key={subscriber.id} className="border-border/50 hover:bg-accent/50 transition-colors group">
                                            <TableCell className="py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Mail className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {subscriber.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {subscriber.is_active ? (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full px-3 py-0.5">
                                                        <UserCheck className="w-3 h-3 mr-1" />
                                                        Actif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-full px-3 py-0.5">
                                                        <UserMinus className="w-3 h-3 mr-1" />
                                                        Inactif
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(subscriber.subscribed_at), 'dd MMMM yyyy', { locale: fr })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(subscriber.id)}
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface StatsCardProps {
    title: string;
    value: number;
    icon: any;
    description: string;
    color?: string;
}

const StatsCard = ({ title, value, icon: Icon, description, color = "text-primary" }: StatsCardProps) => (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all rounded-2xl group">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-display font-bold text-foreground tabular-nums">{value}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {description}
                    </p>
                </div>
                <div className={`h-12 w-12 rounded-2xl bg-accent flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default AdminNewsletter;

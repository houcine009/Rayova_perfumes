import { useState } from 'react';
import { Loader2, Search, Trash, ShieldAlert, UserX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBlacklist, type BlacklistedPhone } from '@/hooks/useBlacklist';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

const AdminBlacklist = () => {
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const [entryToDelete, setEntryToDelete] = useState<BlacklistedPhone | null>(null);

    const { blacklist, isLoading, removeFromBlacklist } = useBlacklist();

    const filteredBlacklist = blacklist?.filter((item) =>
        item.phone.toLowerCase().includes(search.toLowerCase()) ||
        item.reason?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async () => {
        if (!entryToDelete) return;
        try {
            await removeFromBlacklist.mutateAsync(entryToDelete.id);
            toast({ title: "Numéro supprimé de la liste noire" });
            setEntryToDelete(null);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la suppression",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                    Liste Noire
                </h1>
                <p className="text-muted-foreground mt-1">
                    Gérez les numéros de téléphone bannis de la plateforme
                </p>
            </div>

            <Card className="border-red-500/10 bg-red-500/5">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <CardTitle className="text-lg">Protection Anti-Fraude</CardTitle>
                    </div>
                    <CardDescription className="text-red-600/70 dark:text-red-400/70 font-medium">
                        Les numéros présents dans cette liste ne pourront plus passer de commande.
                        Le blocage s'applique au téléphone de livraison et au numéro WhatsApp.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un numéro ou un motif..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !filteredBlacklist || filteredBlacklist.length === 0 ? (
                        <div className="text-center py-12">
                            <UserX className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Aucun numéro dans la liste noire
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Motif du blocage</TableHead>
                                        <TableHead>Date d'ajout</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBlacklist.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono font-bold text-red-600 dark:text-red-400">
                                                {formatPhoneDisplay(item.phone)}
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <p className="line-clamp-2 italic text-sm text-foreground/80">
                                                    {item.reason || "Aucun motif renseigné"}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    onClick={() => setEntryToDelete(item)}
                                                    title="Retirer de la liste noire"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer de la liste noire ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le numéro {entryToDelete && formatPhoneDisplay(entryToDelete.phone)} pourra à nouveau passer des commandes sur le site.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-emerald-600 hover:bg-emerald-700">
                            Autoriser à nouveau
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminBlacklist;

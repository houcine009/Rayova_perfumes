import { useState } from 'react';
import { Loader2, Search, Eye, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, useUpdateOrderStatus, useDeleteOrder, type OrderWithItems, type OrderStatus } from '@/hooks/useOrders';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  processing: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  shipped: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  delivered: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null);

  const { isSuperAdmin } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();

  const filteredOrders = orders?.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast({ title: 'Statut mis à jour' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  }
  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder.mutateAsync(orderToDelete.id);
      toast({ title: "Commande supprimée" });
      setOrderToDelete(null);
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
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Commandes
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les commandes de vos clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro..."
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
          ) : filteredOrders?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune commande trouvée
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at!).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{Number(order.total).toFixed(2)} MAD</TableCell>
                      <TableCell>
                        <Select
                          value={order.status || 'pending'}
                          onValueChange={(value: OrderStatus) =>
                            handleStatusChange(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status || 'pending']
                                  }`}
                              >
                                {statusLabels[order.status || 'pending']}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => setOrderToDelete(order)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Commande {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at!).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedOrder.status || 'pending']
                      }`}
                  >
                    {statusLabels[selectedOrder.status || 'pending']}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Adresse de livraison</p>
                <p className="font-medium">
                  {selectedOrder.shipping_address || 'Non renseignée'}
                  {selectedOrder.shipping_city && `, ${selectedOrder.shipping_city}`}
                  {selectedOrder.shipping_postal_code && ` ${selectedOrder.shipping_postal_code}`}
                </p>
                {selectedOrder.shipping_phone && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Tél: {selectedOrder.shipping_phone}
                    </p>
                    <a
                      href={`https://wa.me/${selectedOrder.shipping_phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Contacter sur WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.249-.57-.398zM12 4c-4.418 0-8 3.582-8 8 0 1.408.366 2.736.996 3.882L3.5 19.5l3.774-1.487C8.428 18.666 9.686 19 11 19c4.418 0 8-3.582 8-8s-3.582-8-8-8z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-accent/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qté: {item.quantity} × {Number(item.product_price).toFixed(2)} MAD
                        </p>
                      </div>
                      <p className="font-medium">{Number(item.subtotal).toFixed(2)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{Number(selectedOrder.subtotal).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{Number(selectedOrder.shipping_cost || 0).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{Number(selectedOrder.total).toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement la commande {orderToDelete?.order_number}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;

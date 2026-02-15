import { useState } from 'react';
import { Loader2, Search, Check, X, Star, Trash2 } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReviews, useApproveReview, useRejectReview, useDeleteReview } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';

const AdminReviews = () => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: reviews, isLoading } = useReviews();
  const approveReview = useApproveReview();
  const rejectReview = useRejectReview();
  const deleteReview = useDeleteReview();
  const { toast } = useToast();

  const filteredReviews = reviews?.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await approveReview.mutateAsync(id);
        toast({ title: 'Avis approuvé' });
      } else {
        await rejectReview.mutateAsync(id);
        toast({ title: 'Avis rejeté' });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteReview.mutateAsync(deleteId);
      toast({ title: 'Avis supprimé' });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Avis clients
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les avis sur vos produits
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
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
          ) : filteredReviews?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun avis trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Note</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews?.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground'
                              }
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {review.title || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.comment || '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${review.is_approved
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-orange-500/20 text-orange-500'
                            }`}
                        >
                          {review.is_approved ? 'Approuvé' : 'En attente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!review.is_approved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500"
                              onClick={() => handleApprove(review.id, true)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {review.is_approved && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-500"
                              onClick={() => handleApprove(review.id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'avis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'avis sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviews;

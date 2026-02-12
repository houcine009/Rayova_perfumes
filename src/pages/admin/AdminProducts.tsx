import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
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
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useProducts, useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

type ProductGender = 'homme' | 'femme' | 'unisexe' | 'niche';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  gender: ProductGender;
  volume_ml: number | null;
  notes_top: string;
  notes_heart: string;
  notes_base: string;
  stock_quantity: number | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  category_ids: string[];
  rating: number;
  reviews_count: number;
}

const defaultFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: 0,
  original_price: null,
  gender: 'unisexe',
  volume_ml: 100,
  notes_top: '',
  notes_heart: '',
  notes_base: '',
  stock_quantity: null,
  is_featured: false,
  is_new: false,
  is_active: true,
  category_ids: [],
  rating: 5,
  reviews_count: 0,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const filteredProducts = Array.isArray(products)
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name),
    });
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      price: Number(product.price) || 0,
      original_price: product.original_price ? Number(product.original_price) : null,
      gender: product.gender,
      volume_ml: product.volume_ml ? Number(product.volume_ml) : null,
      notes_top: product.notes_top || '',
      notes_heart: product.notes_heart || '',
      notes_base: product.notes_base || '',
      stock_quantity: product.stock_quantity !== null ? Number(product.stock_quantity) : null,
      is_featured: !!product.is_featured,
      is_new: !!product.is_new,
      is_active: product.is_active !== false,
      category_ids: product.category_ids || product.categories?.map(c => c.id) || [],
      rating: Number(product.rating) || 5,
      reviews_count: Number(product.reviews_count) || 0,
    });
    setIsDialogOpen(true);
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (editingId) {
      // Direct upload if editing
      const loadingToast = toast({ title: 'Chargement...', description: "Envoi du média" });
      try {
        const { api } = await import('@/lib/api');
        for (const file of Array.from(files)) {
          await api.upload(`/admin/products/${editingId}/media`, file);
        }
        toast({ title: 'Média ajouté avec succès' });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
      } catch (error: any) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      }
    } else {
      // Local selection if creating
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let product;
      if (editingId) {
        product = await updateProduct.mutateAsync({
          id: editingId,
          updates: formData,
        });
        toast({ title: 'Produit mis à jour avec succès' });
      } else {
        const response: any = await createProduct.mutateAsync(formData);
        // The hook already returns response.data
        product = response;

        // Final upload for new product
        if (selectedFiles.length > 0 && product?.id) {
          const { api } = await import('@/lib/api');
          for (const file of selectedFiles) {
            await api.upload(`/admin/products/${product.id}/media`, file);
          }
        }
        toast({ title: 'Produit créé avec succès' });
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(defaultFormData);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await api.delete(`/admin/products/media/${mediaId}`);
      toast({ title: 'Média supprimé' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
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
      await deleteProduct.mutateAsync(deleteId);
      toast({ title: 'Produit supprimé' });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(defaultFormData);
      setSelectedFiles([]);
      setPreviews([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            Produits
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue de parfums
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Description courte</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (MAD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Prix original</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume (ml)</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={formData.volume_ml || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volume_ml: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: ProductGender) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                      <SelectItem value="unisexe">Unisexe</SelectItem>
                      <SelectItem value="niche">Niche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catégories</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-40 overflow-y-auto">
                  {categories?.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`cat-${category.id}`}
                        checked={formData.category_ids.includes(category.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            category_ids: checked
                              ? [...prev.category_ids, category.id]
                              : prev.category_ids.filter(id => id !== category.id)
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes_top">Notes de tête</Label>
                  <Input
                    id="notes_top"
                    value={formData.notes_top}
                    onChange={(e) =>
                      setFormData({ ...formData, notes_top: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes_heart">Notes de cœur</Label>
                  <Input
                    id="notes_heart"
                    value={formData.notes_heart}
                    onChange={(e) =>
                      setFormData({ ...formData, notes_heart: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes_base">Notes de fond</Label>
                  <Input
                    id="notes_base"
                    value={formData.notes_base}
                    onChange={(e) =>
                      setFormData({ ...formData, notes_base: e.target.value })
                    }
                  />
                </div>
              </div>


              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label htmlFor="is_featured">En vedette</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_new: checked })
                    }
                  />
                  <Label htmlFor="is_new">Nouveau</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label>Médias du produit (Images/Vidéos)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Existing Media Preview */}
                  {editingId && products?.find(p => p.id === editingId)?.media?.map((m) => (
                    <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMedia(m.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* New Media Previews (during creation) */}
                  {previews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-primary/30 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setPreviews(prev => prev.filter((_, i) => i !== index));
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">Nouveau</div>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Ajouter</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          ) : filteredProducts?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun produit trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{Number(product.price).toFixed(2)} MAD</TableCell>
                      <TableCell className="capitalize">{product.gender}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${product.is_active
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                            }`}
                        >
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(product.id)}
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
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé.
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

export default AdminProducts;

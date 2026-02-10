import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    city: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Veuillez ajouter des produits à votre panier",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder.mutateAsync({
        customer_name: formData.fullName,
        shipping_phone: formData.phone,
        whatsapp_phone: formData.whatsapp,
        shipping_city: formData.city,
        shipping_address: formData.address,
        notes: formData.notes,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: "pending",
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      });

      setOrderNumber(order.order_number);
      setOrderComplete(true);
      clearCart();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container-luxury max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
                Commande confirmée !
              </h1>
              <p className="text-muted-foreground mb-2">
                Merci pour votre commande. Votre numéro de commande est :
              </p>
              <p className="text-2xl font-bold text-primary mb-6">{orderNumber}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Nous vous contacterons sur WhatsApp ({formData.whatsapp}) pour confirmer les détails de livraison.
              </p>
              <Button variant="luxury" onClick={() => navigate("/boutique")}>
                Continuer mes achats
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    navigate("/panier");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-8">
              Finaliser la commande
            </h1>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Informations de livraison</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone d'appel *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="06XXXXXXXX"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground italic">Pour vous appeler lors de la livraison</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">Numéro WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="06XXXXXXXX"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground italic">Pour confirmer les détails par message</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse complète *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Numéro, rue, quartier..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Livraison par Ozon Express</p>
                        <p className="text-xs text-muted-foreground">Livraison rapide et sécurisée partout au Maroc.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Paiement à la livraison (COD)</p>
                        <p className="text-xs text-muted-foreground">Payer uniquement lors de la réception de votre colis.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Politique de retour</p>
                        <p className="text-xs text-muted-foreground">Retours acceptés sous certaines conditions. Contactez-nous pour plus d'infos.</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="luxury"
                    className="w-full mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      `Confirmer la commande • ${total.toLocaleString("fr-MA")} MAD`
                    )}
                  </Button>

                  <div className="pt-4 mt-4 border-t border-border flex flex-wrap justify-center gap-4 text-xs text-muted-foreground text-center">
                    <a href="/politique-de-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</a>
                    <span>•</span>
                    <a href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</a>
                    <span>•</span>
                    <a href="/cgv" className="hover:text-primary transition-colors">CGV</a>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:order-last">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-28">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Votre commande
                  </h2>

                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.price * item.quantity).toLocaleString("fr-MA")} MAD
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toLocaleString("fr-MA")} MAD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison (toutes villes)</span>
                      <span>{shippingCost} MAD</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">{total.toLocaleString("fr-MA")} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

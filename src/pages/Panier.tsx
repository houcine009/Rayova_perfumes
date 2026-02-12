import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { MediaDisplay } from "@/components/common/MediaDisplay";

export default function Panier() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, total, itemCount } = useCart();

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
              Mon Panier
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Votre panier est vide
                </h2>
                <p className="text-muted-foreground mb-6">
                  Découvrez notre collection de parfums de luxe
                </p>
                <Link to="/boutique">
                  <Button variant="luxury">
                    Continuer mes achats
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4 p-4 bg-card border border-border rounded-lg"
                    >
                      <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                        <MediaDisplay
                          src={item.image}
                          alt={item.name}
                          autoPlay={true}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        {item.volume_ml && (
                          <p className="text-sm text-muted-foreground">{item.volume_ml} ml</p>
                        )}
                        <p className="text-primary font-semibold mt-1">
                          {item.price.toLocaleString("fr-MA")} MAD
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 sticky top-28">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Résumé de la commande
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
                        </span>
                        <span className="font-medium">{subtotal.toLocaleString("fr-MA")} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Livraison</span>
                        <span className="font-medium">{shippingCost} MAD</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span className="text-primary">{total.toLocaleString("fr-MA")} MAD</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/checkout" className="block mt-6">
                      <Button variant="luxury" className="w-full">
                        Passer la commande
                      </Button>
                    </Link>
                    <Link to="/boutique" className="block mt-3">
                      <Button variant="outline" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continuer mes achats
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

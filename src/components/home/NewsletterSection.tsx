import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Merci pour votre inscription !");
        setEmail("");
      } else {
        toast.error(data.message || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
            Newsletter
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
            Rejoignez l'Univers Rayova
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Inscrivez-vous pour recevoir en exclusivité nos nouveautés,
            offres spéciales et conseils parfumés.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 bg-background border-border focus:border-primary rounded-none text-center sm:text-left"
              required
            />
            <Button
              type="submit"
              variant="luxury"
              size="xl"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>

          <p className="text-muted-foreground text-xs mt-6">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

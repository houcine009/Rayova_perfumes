import { motion } from "framer-motion";
import { Sparkles, Truck, Shield, Award } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Qualité Premium",
    description: "Ingrédients sélectionnés avec soin pour une expérience olfactive exceptionnelle",
  },
  {
    icon: Truck,
    title: "Livraison Express",
    description: "Livraison rapide et sécurisée partout au Maroc sous 24-48h",
  },
  {
    icon: Shield,
    title: "Authenticité Garantie",
    description: "100% produits authentiques avec certificat d'authenticité",
  },
  {
    icon: Award,
    title: "Service Excellence",
    description: "Conseils personnalisés et service client disponible 7j/7",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding bg-background border-y border-border">
      <div className="container-luxury">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/5 mb-6 transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Sparkles, Award, Heart } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "Nous ne proposons que des parfums d'une qualité exceptionnelle, rigoureusement sélectionnés.",
  },
  {
    icon: Sparkles,
    title: "Authenticité",
    description: "100% de produits authentiques, avec garantie et certificat d'origine.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Notre amour pour la parfumerie guide chacune de nos décisions et recommandations.",
  },
];

export function AboutSection() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
            Notre Histoire
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            À Propos de <span className="text-gold-gradient">Rayova</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Rayova incarne l'excellence dans l'art de la parfumerie. 
            Notre maison est née d'une passion profonde pour les fragrances 
            exceptionnelles et l'artisanat de luxe.
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-muted-foreground leading-relaxed mb-4">
            Fondée avec la vision de créer des parfums qui transcendent 
            le temps, Rayova s'engage à offrir uniquement les fragrances 
            les plus raffinées et les plus mémorables.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Chaque parfum de notre collection est soigneusement sélectionné, 
            combinant des ingrédients de première qualité avec un savoir-faire 
            artisanal exceptionnel.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-8 luxury-card"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <value.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4">
                {value.title}
              </h3>
              <p className="text-muted-foreground">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
          className="max-w-4xl mx-auto text-center mb-16 space-y-8"
        >
          <div className="space-y-6 text-muted-foreground leading-relaxed text-left md:text-center">
            <p>
              Bienvenue chez <strong>Rayova Parfums</strong>, votre destination ultime pour la <strong>parfumerie de luxe au Maroc</strong>.
              Notre maison est née d'une vision simple mais ambitieuse : démocratiser l'accès aux fragrances les plus sophistiquées
              tout en préservant l'exclusivité et le prestige des grandes maisons de parfum. Que vous soyez à la recherche d'un
              <strong>parfum pour homme</strong> puissant et charismatique, d'un <strong>parfum pour femme</strong> délicat et envoûtant,
              ou d'une création <strong>unisex</strong> audacieuse, notre collection est conçue pour répondre aux attentes des
              amateurs les plus exigeants.
            </p>

            <p>
              Basée au cœur du <strong>Maroc</strong>, Rayova s'inspire de la richesse olfactive de notre pays, mêlant traditions
              ancestrales et modernité occidentale. Nous collaborons avec les meilleurs nez pour sélectionner des ingrédients
              rares et précieux, garantissant une tenue exceptionnelle et un sillage unique. Chaque flacon est une promesse
              d'élégance, un accessoire invisible mais indispensable qui définit votre présence et marque les esprits.
            </p>

            <p>
              Nous comprenons que l'achat d'un <strong>parfum de luxe</strong> est une expérience sensorielle et personnelle.
              C'est pourquoi nous avons mis en place un service client d'exception et une logistique de pointe. Nous offrons la
              <strong>livraison rapide sur tout le Maroc</strong> (Casablanca, Rabat, Marrakech, Tanger, Agadir, et toutes les villes du Royaume).
              Pour votre sérénité, nous proposons le <strong>paiement à la livraison (COD - Cash on Delivery)</strong>, vous permettant
              de commander en toute confiance et de régler votre achat uniquement à la réception de votre colis.
            </p>

            <p>
              Chez Rayova, nous ne vendons pas seulement des parfums ; nous partageons une passion. Notre mission est de vous
              accompagner dans la quête de votre identité olfactive, en vous proposant des collections <strong>Niche</strong>,
              <strong>Prestige</strong> et <strong>Premium</strong> à des prix justes. Rejoignez la communauté Rayova et
              découvrez pourquoi nous sommes devenus la référence de la parfumerie sélective au Maroc.
            </p>
          </div>
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

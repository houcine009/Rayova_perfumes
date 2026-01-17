import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

const APropos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="section-padding bg-card border-b border-border">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
                Notre Histoire
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                À Propos de Rayova
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Rayova incarne l'excellence dans l'art de la parfumerie. 
                Notre maison est née d'une passion profonde pour les fragrances 
                exceptionnelles et l'artisanat de luxe.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container-luxury">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="font-display text-3xl md:text-4xl mb-6">
                  L'Excellence Comme <span className="text-gold-gradient">Tradition</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Fondée avec la vision de créer des parfums qui transcendent 
                    le temps, Rayova s'engage à offrir uniquement les fragrances 
                    les plus raffinées et les plus mémorables.
                  </p>
                  <p>
                    Chaque parfum de notre collection est soigneusement sélectionné, 
                    combinant des ingrédients de première qualité avec un savoir-faire 
                    artisanal exceptionnel.
                  </p>
                  <p>
                    Notre engagement envers la qualité se reflète dans chaque aspect 
                    de notre service, de la sélection de nos fragrances à l'expérience 
                    client que nous offrons.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-[4/5] bg-card border border-border overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                    <p className="font-display text-4xl text-primary/30">Rayova</p>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-primary/30" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-card">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
                Nos Valeurs
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                Ce Qui Nous Définit
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Excellence", description: "Nous ne proposons que des parfums d'une qualité exceptionnelle, rigoureusement sélectionnés." },
                { title: "Authenticité", description: "100% de produits authentiques, avec garantie et certificat d'origine." },
                { title: "Passion", description: "Notre amour pour la parfumerie guide chacune de nos décisions et recommandations." },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-8 border border-border bg-background"
                >
                  <h3 className="font-display text-2xl text-primary mb-4">
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
      </main>
      <Footer />
    </div>
  );
};

export default APropos;

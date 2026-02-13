import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-optimize">
          <CollectionsSection />
        </div>
        <div className="section-optimize">
          <FeaturedProducts />
        </div>
        <div className="section-optimize">
          <FeaturesSection />
        </div>
        <div className="section-optimize">
          <AboutSection />
        </div>
        <div className="section-optimize">
          <NewsletterSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

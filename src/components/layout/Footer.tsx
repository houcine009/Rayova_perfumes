import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-rayova.png";
import { useCategories } from "@/hooks/useCategories";

const informationsLinks = [
  { name: "À Propos", href: "/a-propos" },
  { name: "Livraison", href: "/livraison" },
  { name: "Politique de retour", href: "/retours" },
];

const legalLinks = [
  { name: "Mentions légales", href: "/mentions-legales" },
  { name: "Politique de confidentialité", href: "/confidentialite" },
  { name: "CGV", href: "/cgv" },
];

export function Footer() {
  const { data: categories } = useCategories();

  const boutiqueLinks = [
    { name: "Tous les parfums", href: "/boutique" },
    ...(categories?.filter(c => c.is_active).map(c => ({
      name: c.name,
      href: `/categorie/${c.slug}`
    })) || [
        { name: "Collection Niche", href: "/categorie/niche" },
        { name: "Pour Homme", href: "/categorie/homme" },
        { name: "Pour Femme", href: "/categorie/femme" },
      ]),
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img
                src={logo}
                alt="Rayova Parfums"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Rayova incarne l'art de la parfumerie de luxe. Chaque fragrance
              est une œuvre d'art, créée avec passion et expertise.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/rayovaparfums"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61569540570887&ref=NONE_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="font-display text-lg mb-6 text-primary">Boutique</h4>
            <ul className="space-y-3">
              {boutiqueLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-display text-lg mb-6 text-primary">
              Informations
            </h4>
            <ul className="space-y-3">
              {informationsLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-6 text-primary">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Morocco, Casablanca
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="tel:0612993152"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  0612993152
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:Rayovamaroc@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Rayovamaroc@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Rayova Parfums. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-xs"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

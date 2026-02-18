import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, User, LogOut, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-rayova.png";

import { useCategories } from "@/hooks/useCategories";

const logoHeight = "h-12 lg:h-16"; // Pre-calculating for consistency

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Check for saved theme preference - default to dark mode for luxury feel
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      // Default to dark mode or explicitly use saved 'dark'
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const { data: categories } = useCategories();

  const dynamicNavLinks = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/boutique" },
    ...(categories?.filter(c => c.is_active && c.slug !== 'unisexe' && c.slug !== 'unisex').map(c => ({
      name: c.name,
      href: `/categorie/${c.slug}`
    })) || []),
    { name: "À Propos", href: "/a-propos" },
    { name: "Suivi Commande", href: "/suivi-commande" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
          }`}
      >
        <nav className="container-luxury">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt="Rayova Parfums"
                className="h-12 lg:h-16 w-auto"
                width="200"
                height="64"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-black tracking-widest uppercase transition-all duration-300 ${location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:flex text-muted-foreground hover:text-primary transition-colors"
                aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <div
                className={`relative flex items-center bg-muted/30 rounded-full border border-border/50 transition-all duration-300 ${isSearchOpen ? "w-48 sm:w-64 px-3" : "w-10"
                  }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex-shrink-0 hover:bg-transparent"
                  aria-label="Rechercher"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "100%", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="absolute left-10 right-3 overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            navigate(`/boutique?search=${searchQuery}`);
                            setIsSearchOpen(false);
                          }
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold py-1 placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden sm:flex hover:text-primary transition-colors"
                      aria-label="Menu utilisateur"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-popover/80 backdrop-blur-xl border border-border/50 overflow-hidden rounded-[1.5rem] shadow-2xl p-2 mt-2"
                  >
                    <div className="px-4 py-3 bg-muted/30 rounded-xl mb-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                        Session Active
                      </p>
                      <p className="text-xs font-bold truncate opacity-80">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border/30 my-2" />
                    <DropdownMenuItem
                      onClick={() => navigate("/mes-commandes")}
                      className="gap-3 p-3 cursor-pointer hover:bg-primary/10 rounded-xl transition-all group"
                    >
                      <ShoppingBag className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">
                        Mes Commandes
                      </span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="gap-3 p-3 cursor-pointer hover:bg-primary/10 rounded-xl transition-all group"
                      >
                        <Settings className="h-4 w-4 text-primary group-hover:rotate-45 transition-transform" />
                        <span className="font-bold text-[10px] uppercase tracking-widest">
                          Administration
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border/30 my-2" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="gap-3 p-3 cursor-pointer text-destructive hover:bg-destructive/10 rounded-xl transition-all group"
                    >
                      <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">
                        Déconnexion
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {!user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex rounded-full px-6 font-black uppercase text-[10px] tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                  asChild
                >
                  <Link to="/auth">Connexion</Link>
                </Button>
              )}

              <Link to="/panier">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:text-primary transition-colors"
                  aria-label="Voir le panier"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background pt-24 lg:hidden"
          >
            <nav className="container-luxury py-8">
              <div className="flex flex-col gap-6">
                {dynamicNavLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`text-2xl font-display tracking-wide transition-colors duration-300 ${location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground/70 hover:text-primary"
                        }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                {/* Theme toggle for mobile */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 mb-4"
                  onClick={toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? "Mode clair" : "Mode sombre"}
                </Button>

                {user ? (
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/mes-commandes")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Mes Commandes
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full text-left justify-start"
                        onClick={() => navigate("/admin")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full text-left justify-start text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Connexion / Inscription
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

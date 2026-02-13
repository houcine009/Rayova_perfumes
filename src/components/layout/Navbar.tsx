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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
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
                  className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex" aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 sm:w-64' : 'w-10'}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex-shrink-0"
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
                      className="absolute left-10 right-0 overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            navigate(`/boutique?search=${searchQuery}`);
                            setIsSearchOpen(false);
                          }
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-1"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Menu utilisateur">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                    <DropdownMenuItem className="text-muted-foreground text-sm">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}



              <Link to="/panier">
                <Button variant="ghost" size="icon" className="relative" aria-label="Voir le panier">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>

              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/admin")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  null
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  FolderTree,
} from 'lucide-react';
import logo from '@/assets/logo-rayova.png';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produits', href: '/admin/produits', icon: Package },
  { name: 'Catégories', href: '/admin/categories', icon: FolderTree },
  { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { name: 'Avis', href: '/admin/avis', icon: Star },
];

const superAdminNavItems = [
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

const AdminDashboard = () => {
  const { user, profile, isSuperAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const allNavItems = isSuperAdmin
    ? [...adminNavItems, ...superAdminNavItems]
    : adminNavItems;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020817] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border/50">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <img src={logo} alt="Rayova" className="h-6 w-auto brightness-0 invert" />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-xl tracking-tight text-foreground">Rayova</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Administration</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Menu Principal</p>
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                >
                  <item.icon size={20} className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {isSuperAdmin && (
              <>
                <div className="pt-6 pb-2">
                  <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Configuration</p>
                </div>
                {superAdminNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                    >
                      <item.icon size={20} className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-border/50 bg-accent/20">
            <div className="px-4 py-4 rounded-xl bg-card/50 border border-border/50 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {profile?.first_name?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="font-bold text-sm text-foreground truncate">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-primary">
                  {isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        {/* Header */}
        <header className="h-20 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 lg:px-10">
          <button
            className="lg:hidden p-2.5 rounded-xl bg-accent/50 text-foreground hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="rounded-xl hidden sm:flex">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <Star className="mr-2 h-4 w-4 text-amber-500 fill-amber-500" />
                Voir le site
              </Link>
            </Button>
            <div className="h-8 w-px bg-border/50 hidden sm:block mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-bold">{profile?.first_name}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">En ligne</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground font-bold">
                {profile?.first_name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 relative z-10 transition-all duration-300">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

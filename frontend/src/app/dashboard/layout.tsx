'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plane, Map, DollarSign, Package, BookOpen,
  User, LogOut, Settings, Brain, Globe, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Plane, label: 'My Trips', href: '/trips' },
  { icon: Map, label: 'Itinerary', href: '/trips', badge: null },
  { icon: Globe, label: 'Discover Cities', href: '/cities' },
  { icon: DollarSign, label: 'Budget', href: '/budget' },
  { icon: Package, label: 'Packing', href: '/packing' },
  { icon: BookOpen, label: 'Journal', href: '/journal' },
  { icon: Brain, label: 'AI Assistant', href: '/ai' },
];

const bottomNavItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch { /* ignore */ }
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated) return null;

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
          isActive
            ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'}`} />
        <span className="text-sm font-medium">{item.label}</span>
        {isActive && <ChevronRight className="w-3 h-3 ml-auto text-brand-400" />}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'flex' : 'hidden md:flex'} flex-col w-64 h-full bg-surface-900 border-r border-surface-800 p-4`}>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
          <Plane className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-display font-bold gradient-text">Traveloop</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => <NavLink key={item.href + item.label} item={item} />)}
      </nav>

      {/* Bottom items */}
      <div className="space-y-1 pt-4 border-t border-surface-800 mt-4">
        {bottomNavItems.map((item) => <NavLink key={item.href} item={item} />)}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      {/* User info */}
      <div className="mt-4 p-3 glass rounded-xl flex items-center gap-3">
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-surface-500 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-64"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-surface-800 flex items-center justify-between px-4 md:px-6 bg-surface-900/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-800 text-surface-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-medium text-surface-400">
                {navItems.find(n => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.label || 'Traveloop'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-surface-800 text-surface-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <Link href="/trips/create" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all btn-glow">
              <span>+</span> New Trip
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-surface-800 flex items-center justify-around py-3 z-30">
          {[
            { icon: LayoutDashboard, href: '/dashboard', label: 'Home' },
            { icon: Plane, href: '/trips', label: 'Trips' },
            { icon: Brain, href: '/ai', label: 'AI' },
            { icon: User, href: '/profile', label: 'Profile' },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 px-3 ${isActive ? 'text-brand-400' : 'text-surface-500'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

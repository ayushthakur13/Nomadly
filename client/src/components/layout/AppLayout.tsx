import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AppNavbar from '../common/AppNavbar';
import Sidebar from '../common/Sidebar';
import MobileSidebar from '../common/MobileSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default: tablet collapsed, desktop expanded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      setCollapsed(!isDesktop); // collapsed on <1024px
    }
  }, []);

  // Keep sidebar closed on the create-trip page to reduce distractions
  useEffect(() => {
    if (location.pathname.startsWith('/trips/new')) {
      setCollapsed(true);
      setMobileOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar
        onToggleSidebar={() => setCollapsed((c) => !c)}
        isSidebarCollapsed={collapsed}
        onOpenMobileSidebar={() => setMobileOpen(true)}
      />
      <div className="flex pt-16">
        {/* Fixed sidebar: hidden on mobile, visible on md+ */}
        <Sidebar className="hidden md:block" collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="md:hidden">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </div>
        )}

        <main className={`flex-1 min-h-[calc(100vh-4rem)] bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 transition-all duration-200 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

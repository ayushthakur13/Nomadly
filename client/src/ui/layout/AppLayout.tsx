import { useEffect, type ReactNode, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, setSidebarCollapsed } from "../../store/uiSlice";
import AppNavbar from "../common/AppNavbar";
import Sidebar from "../common/Sidebar";
import MobileSidebar from "../common/MobileSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarCollapsed: collapsed, hasUserPreference } = useSelector(
    (state: any) => state.ui
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Trip workspace detection (EXCLUDES /trips/new)
  const isTripWorkspace = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[1] === "trips" && parts[2] && parts[2] !== "new";
  }, [location.pathname]);

  // Establish default collapse behavior
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const isCreateTrip = location.pathname.startsWith("/trips/new");

    if (isCreateTrip || isTripWorkspace) {
      dispatch(setSidebarCollapsed(true));
      return;
    }

    if (!hasUserPreference) {
      dispatch(setSidebarCollapsed(!isDesktop));
    }
  }, [location.pathname, hasUserPreference, isTripWorkspace, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <AppNavbar
        onToggleSidebar={() => dispatch(toggleSidebar())}
        isSidebarCollapsed={collapsed}
        onOpenMobileSidebar={() => setMobileOpen(true)}
      />

      <div
        className={`flex pt-16 ${
          isTripWorkspace ? "h-[calc(100vh-4rem)] overflow-hidden" : ""
        }`}
      >
        {/* Primary Sidebar */}
        <Sidebar
          className="hidden md:block"
          collapsed={collapsed}
          onToggle={() => dispatch(toggleSidebar())}
        />

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="md:hidden">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 bg-gray-50 transition-all duration-200 ${
            collapsed ? "md:ml-20" : "md:ml-64"
          } ${
            isTripWorkspace
              ? "overflow-hidden"
              : "min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6"
          }`}
          style={{ ["--sidebar-width" as any]: collapsed ? "5rem" : "16rem" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

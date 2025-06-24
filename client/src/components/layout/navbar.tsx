import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronDown, User, LogOut, Bell, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

export default function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/transactions':
        return 'Transaksi';
      case '/reports':
        return 'Laporan';
      case '/profile':
        return 'Profil';
      default:
        return 'Dashboard';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.logout();
    setLocation("/");
    window.location.reload();
  };

  const handleProfileClick = () => {
    setLocation("/profile");
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={financewhizLogo} 
              alt="FinanceWhiz.AI Logo" 
              className="w-8 h-8"
            />
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white font-league">FinanceWhiz.AI</span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-league">Manajemen Keuangan UMKM</div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Action Icons */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Send Money">
                <Send className="h-4 w-4 text-[#f29716]" />
              </div>
              <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Security">
                <Lock className="h-4 w-4 text-[#04474f]" />
              </div>
              <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Notifications">
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <ThemeToggle />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800 font-league p-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 bg-[#04474f] rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{user?.businessName}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-league"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil Saya
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-league"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

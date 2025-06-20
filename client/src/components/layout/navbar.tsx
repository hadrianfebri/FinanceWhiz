import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronDown, User, LogOut, Bell, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src={financewhizLogo} 
                alt="FinanceWhiz.AI Logo" 
                className="w-8 h-8"
              />
              <div>
                <span className="text-lg font-bold text-gray-900 font-league">FinanceWhiz.AI</span>
                <div className="text-xs text-gray-500 font-league">Manajemen Keuangan UMKM</div>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900 font-league">{getPageTitle()}</h1>
          </div>

          {/* Quick Actions Panel & Profile */}
          <div className="flex items-center space-x-4">
            {/* Quick Action Icons */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Send Money">
                <Send className="h-5 w-5 text-[#f29716]" />
              </div>
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Security">
                <Lock className="h-5 w-5 text-[#04474f]" />
              </div>
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center hover:shadow-md transition-all cursor-pointer" title="Notifications">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-50 font-league"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 bg-[#04474f] rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-gray-700">{user?.businessName}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-league"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profil Saya
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-league"
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

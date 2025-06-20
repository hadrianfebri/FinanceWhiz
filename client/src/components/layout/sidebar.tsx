import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, List, BarChart3, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transaksi', href: '/transactions', icon: List },
  { name: 'Laporan', href: '/reports', icon: BarChart3 },
  { name: 'Pengaturan', href: '/profile', icon: Settings },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    api.logout();
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img 
            src={financewhizLogo} 
            alt="FinanceWhiz.AI Logo" 
            className="w-8 h-8"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800 font-league">FinanceWhiz.AI</h1>
            <p className="text-xs text-gray-600">Manajemen Keuangan UMKM</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#04474f] rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 truncate font-league">{user?.businessName || 'Bisnis'}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-league",
                  isActive
                    ? "menu-active bg-[#f29716]/10"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#f29716]"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <Button 
          variant="outline" 
          className="w-full justify-start space-x-2 border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 font-league"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </Button>
      </div>
    </div>
  );
}

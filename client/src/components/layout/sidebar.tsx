import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, List, BarChart3, Settings, User, LogOut, Store, Users, DollarSign, Building2, FileText, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transaksi', href: '/transactions', icon: List },
  { name: 'Laporan', href: '/reports', icon: BarChart3 },
  { name: 'Outlet', href: '/outlets', icon: Store },
  { name: 'Payroll', href: '/payroll', icon: DollarSign },
  { name: 'Vendor', href: '/vendors', icon: Building2 },
  { name: 'Pajak', href: '/tax', icon: FileText },
  { name: 'POS Sync', href: '/pos-sync', icon: RotateCcw },
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

      {/* Navigation Menu */}
      <div className="flex-1 py-6 pt-8">
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


    </div>
  );
}

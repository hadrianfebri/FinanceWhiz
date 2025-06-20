import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, List, BarChart3, Settings } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transaksi', href: '/transactions', icon: List },
  { name: 'Laporan', href: '/reports', icon: BarChart3 },
  { name: 'Pengaturan', href: '/profile', icon: Settings },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="w-64 bg-white h-screen shadow-sm border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

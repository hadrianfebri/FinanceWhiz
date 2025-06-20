import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ChartLine, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

export default function Navbar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <ChartLine className="h-6 w-6 text-primary mr-3" />
            <span className="text-xl font-bold text-gray-900">FinSmart Lite</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-gray-50"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="text-gray-700">{user?.businessName}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profil Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
    </nav>
  );
}

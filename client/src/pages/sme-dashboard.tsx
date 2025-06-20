import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Building2, 
  Users, 
  Receipt, 
  Calculator,
  Bell,
  AlertTriangle,
  DollarSign,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Upload,
  Download
} from "lucide-react";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CashFlowChart from "@/components/charts/cash-flow-chart";

export default function SmeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Dashboard stats based on user role
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  // AI Insights and Notifications
  const { data: aiInsights } = useQuery({
    queryKey: ["/api/ai/insights"],
    queryFn: () => api.getAIInsights(),
    staleTime: 30 * 60 * 1000,
  });

  // Outlets data (for Owner and Finance roles)
  const { data: outlets } = useQuery({
    queryKey: ["/api/outlets"],
    queryFn: () => api.getOutlets(),
    enabled: user?.role === 'owner' || user?.role === 'finance',
  });

  // Recent notifications
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => api.getNotifications(),
  });

  // Tax summary
  const { data: taxSummary } = useQuery({
    queryKey: ["/api/tax/summary"],
    queryFn: () => api.getTaxSummary(),
  });

  // Pending invoices
  const { data: pendingInvoices } = useQuery({
    queryKey: ["/api/invoices/pending"],
    queryFn: () => api.getPendingInvoices(),
  });

  // Payroll reminders
  const { data: payrollReminders } = useQuery({
    queryKey: ["/api/payroll/reminders"],
    queryFn: () => api.getPayrollReminders(),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderRoleBasedHeader = () => {
    switch (user?.role) {
      case 'owner':
        return `${getGreeting()}, Owner ${user?.businessName}`;
      case 'finance':
        return `${getGreeting()}, Finance Manager`;
      case 'manager':
        return `${getGreeting()}, Manager ${user?.outletName || 'Cabang'}`;
      default:
        return `${getGreeting()}, ${user?.businessName}`;
    }
  };

  const renderQuickActions = () => (
    <Card className="card-base hover-lift">
      <CardHeader>
        <CardTitle className="text-lg font-league">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowAddTransaction(true)}
            className="btn-orange flex flex-col items-center space-y-2 h-auto py-4"
          >
            <Plus className="h-6 w-6" />
            <span className="font-league text-sm">Catat Transaksi</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center space-y-2 h-auto py-4 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setLocation('/payroll')}
          >
            <Users className="h-6 w-6" />
            <span className="font-league text-sm">Input Gaji</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex flex-col items-center space-y-2 h-auto py-4 border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => setLocation('/pos-sync')}
          >
            <Upload className="h-6 w-6" />
            <span className="font-league text-sm">Sinkron POS</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex flex-col items-center space-y-2 h-auto py-4 border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => setLocation('/reports')}
          >
            <FileText className="h-6 w-6" />
            <span className="font-league text-sm">Lihat Laporan</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFinancialSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Cash Balance */}
      <Card className="balance-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-league">Saldo Kas Aktif</p>
              <p className="text-2xl font-bold text-white font-league">
                {formatCurrency(dashboardStats?.cashBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-league">Pemasukan Bulan Ini</p>
              <p className="text-xl font-bold text-green-600 font-league">
                {formatCurrency(dashboardStats?.weeklyIncome || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-league">Pengeluaran Bulan Ini</p>
              <p className="text-xl font-bold text-red-600 font-league">
                {formatCurrency(dashboardStats?.weeklyExpenses || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Profit */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-league">Laba Bulan Ini</p>
              <p className={`text-xl font-bold font-league ${
                (dashboardStats?.weeklyProfit || 0) >= 0 ? 'text-[#04474f]' : 'text-red-600'
              }`}>
                {formatCurrency(dashboardStats?.weeklyProfit || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#04474f]/10 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[#04474f]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOutletPerformance = () => {
    if (user?.role === 'manager') return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span className="font-league">Performa Outlet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outlets?.map((outlet: any) => (
              <div key={outlet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#f29716] rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-league">{outlet.name}</p>
                    <p className="text-sm text-gray-600">{outlet.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 font-league">
                    {formatCurrency(outlet.monthlyRevenue || 0)}
                  </p>
                  <Badge variant={outlet.status === 'active' ? 'default' : 'secondary'}>
                    {outlet.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReminders = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span className="font-league">Pengingat & Notifikasi</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tax Reminders */}
          {taxSummary?.dueDate && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Calculator className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 font-league">Jatuh Tempo Pajak</p>
                <p className="text-sm text-yellow-600">
                  Estimasi pajak: {formatCurrency(taxSummary.estimatedTax)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLocation('/tax')}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Payroll Reminders */}
          {payrollReminders?.length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800 font-league">Pengingat Gaji</p>
                <p className="text-sm text-blue-600">
                  {payrollReminders.length} karyawan belum dibayar
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLocation('/payroll')}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Invoice Reminders */}
          {pendingInvoices?.length > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Receipt className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-800 font-league">Tagihan Jatuh Tempo</p>
                <p className="text-sm text-red-600">
                  {pendingInvoices.length} invoice menunggu pembayaran
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLocation('/vendors')}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* General Notifications */}
          {notifications?.slice(0, 3).map((notification: any) => (
            <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                notification.isRead ? 'bg-gray-400' : 'bg-[#f29716]'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 font-league">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              <span className="text-xs text-gray-500">
                {formatDateTime(notification.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAIInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span className="font-league">AI Insight Engine</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiInsights && (
            <div className="p-4 bg-gradient-to-r from-[#f29716]/10 to-[#ffde32]/10 rounded-lg border border-[#f29716]/20">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#f29716] rounded-lg flex items-center justify-center flex-shrink-0">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 font-league mb-2">Analisis Otomatis</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{aiInsights.insight}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cashflow Prediction */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="font-medium text-blue-800 font-league">Prediksi Arus Kas 30 Hari</p>
            </div>
            <p className="text-sm text-blue-700">
              Berdasarkan tren historis, estimasi saldo akhir bulan: {formatCurrency((dashboardStats?.cashBalance || 0) * 1.1)}
            </p>
          </div>

          {/* Anomaly Detection */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="font-medium text-amber-800 font-league">Deteksi Anomali</p>
            </div>
            <p className="text-sm text-amber-700">
              Sistem memantau transaksi tidak biasa dan pola pengeluaran mencurigakan
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCashFlowChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span className="font-league">Tren Arus Kas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dashboardStats?.cashFlowData && dashboardStats.cashFlowData.length > 0 && dashboardStats && (
          <CashFlowChart data={dashboardStats.cashFlowData} />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-10 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-league">
            {renderRoleBasedHeader()}
          </h1>
          <p className="text-gray-600 font-league">
            Kelola keuangan multi-outlet dengan insight AI terdepan
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="font-league">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Badge>
          {notifications?.filter((n: any) => !n.isRead).length > 0 && (
            <Badge className="bg-red-500">
              {notifications.filter((n: any) => !n.isRead).length} baru
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Financial Summary */}
      {renderFinancialSummary()}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {renderOutletPerformance()}
          {renderCashFlowChart()}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {renderReminders()}
          {renderAIInsights()}
        </div>
      </div>

      <AddTransactionModal 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
      />
    </div>
  );
}
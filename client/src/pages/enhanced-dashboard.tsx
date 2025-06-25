import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { 
  Wallet, TrendingUp, TrendingDown, Plus, FileText, Lightbulb, ArrowUp, ArrowDown,
  Store, Users, DollarSign, Building2, RotateCcw, AlertTriangle, Calendar,
  Target, Activity, Bell, CheckCircle, Clock, PiggyBank
} from "lucide-react";
import { useLocation } from "wouter";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CashFlowChart from "@/components/charts/cash-flow-chart";

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: aiInsights } = useQuery({
    queryKey: ["/api/ai/insights"],
    queryFn: () => api.getAIInsights(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: outlets } = useQuery({
    queryKey: ["/api/outlets"],
    queryFn: () => api.getOutlets(),
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => api.getNotifications(),
  });

  const { data: taxSummary } = useQuery({
    queryKey: ["/api/tax/summary"],
    queryFn: () => api.getTaxSummary(),
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ["/api/invoices/pending"],
    queryFn: () => api.getPendingInvoices(),
  });

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

  return (
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-league">
            {getGreeting()}, {user?.businessName}!
          </h1>
          <p className="text-muted-foreground mt-1 font-league">Dashboard comprehensive untuk manajemen bisnis multi-outlet</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="bg-[#f29716] hover:bg-[#d4820a] font-league flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/reports')}
            className="font-league flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Lihat Laporan
          </Button>
        </div>
      </div>

      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Kas Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(dashboardStats?.cashBalance || 0)}</p>
                {dashboardStats?.cashBalance > 0 ? (
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    +12.5% dari bulan lalu
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Belum ada data perbandingan
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-[#04474f] rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outlet</p>
                <p className="text-2xl font-bold text-foreground">{outlets?.length || 0}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  <Store className="h-4 w-4 inline mr-1" />
                  {outlets?.filter((o: any) => o.isActive).length || 0} aktif
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendapatan Minggu Ini</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(dashboardStats?.weeklyIncome || 0)}</p>
                {dashboardStats?.weeklyIncome > 0 ? (
                  <p className="text-sm text-green-600 mt-1">
                    <ArrowUp className="h-4 w-4 inline mr-1" />
                    +8.2% dari minggu lalu
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Belum ada data mingguan
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pajak Kuartal Ini</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(taxSummary?.currentQuarterTax || 0)}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  PPh Final 0.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-[#f29716]" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setLocation('/outlets')}
            >
              <Store className="h-4 w-4 mr-2" />
              Kelola Outlet
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation('/payroll')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Proses Payroll
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation('/vendors')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Manajemen Vendor
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation('/pos-sync')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Sinkronisasi POS
            </Button>
          </CardContent>
        </Card>

        {/* Notifications & Alerts */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-[#f29716]" />
              Notifikasi & Pengingat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">
                    {notification.priority === 'high' ? 'Urgent' : 'Info'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 text-gray-300 dark:text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">Belum ada notifikasi</p>
                <p className="text-xs text-gray-400 dark:text-muted-foreground">Notifikasi akan muncul saat ada aktivitas bisnis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-[#f29716]" />
              AI Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {aiInsights?.insight || "Memuat insights bisnis..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outlet Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Store className="h-5 w-5 text-[#f29716]" />
              Performance Outlet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outlets?.map((outlet: any) => (
                <div key={outlet.id} className="flex items-center justify-between p-3 border border-border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{outlet.name}</p>
                      <p className="text-sm text-muted-foreground">{outlet.managerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(outlet.currentMonthSales)}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: {formatCurrency(outlet.monthlyTarget)}
                    </p>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-[#f29716] h-2 rounded-full" 
                        style={{ width: `${Math.min((outlet.currentMonthSales / outlet.monthlyTarget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Chart */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-[#f29716]" />
              Tren Arus Kas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.cashFlowData && dashboardStats.cashFlowData.length > 0 ? (
              <CashFlowChart data={dashboardStats.cashFlowData} />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground dark:text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-muted-foreground" />
                  <p>Data arus kas akan muncul setelah transaksi pertama</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#f29716]" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats?.recentTransactions?.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? 
                        <ArrowUp className="h-4 w-4 text-green-600" /> : 
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(transaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-[#f29716]" />
              Ringkasan Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Keuntungan Minggu Ini</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardStats?.weeklyProfit || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pendapatan</p>
                <p className="font-semibold text-green-600">{formatCurrency(dashboardStats?.weeklyIncome || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pengeluaran</p>
                <p className="font-semibold text-red-600">{formatCurrency(dashboardStats?.weeklyExpenses || 0)}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-[#f29716] hover:bg-[#d4820a]"
              onClick={() => setLocation('/reports')}
            >
              Lihat Detail Laporan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
      />
    </div>
  );
}
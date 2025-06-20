import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, FileText, Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CashFlowChart from "@/components/charts/cash-flow-chart";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {getGreeting()}, {user?.businessName}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Catat Transaksi</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Lihat Laporan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Saldo Kas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats?.cashBalance || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pemasukan Minggu Ini</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(dashboardStats?.weeklyIncome || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pengeluaran Minggu Ini</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardStats?.weeklyExpenses || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit/Loss & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Laba/Rugi Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-3xl font-bold ${
                (dashboardStats?.weeklyProfit || 0) >= 0 ? 'text-success' : 'text-red-600'
              }`}>
                {formatCurrency(dashboardStats?.weeklyProfit || 0)}
              </div>
              <div className="text-sm text-gray-600">
                {(dashboardStats?.weeklyProfit || 0) >= 0 ? 'Laba bersih' : 'Rugi bersih'}
              </div>
              <div className="flex justify-center">
                <div className={`w-16 h-16 ${
                  (dashboardStats?.weeklyProfit || 0) >= 0 ? 'bg-success/10' : 'bg-red-100'
                } rounded-full flex items-center justify-center`}>
                  <TrendingUp className={`h-8 w-8 ${
                    (dashboardStats?.weeklyProfit || 0) >= 0 ? 'text-success' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arus Kas 7 Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={dashboardStats?.cashFlowData || []} />
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights?.insight && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Insight Mingguan</h4>
                <p className="text-gray-700">{aiInsights.insight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaksi Terbaru</CardTitle>
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardStats?.recentTransactions?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada transaksi</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowAddTransaction(true)}
                >
                  Tambah Transaksi Pertama
                </Button>
              </div>
            ) : (
              dashboardStats?.recentTransactions?.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-success/10' 
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUp className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddTransactionModal 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
      />
    </div>
  );
}

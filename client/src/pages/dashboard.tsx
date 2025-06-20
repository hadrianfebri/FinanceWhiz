import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, FileText, Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import { useLocation } from "wouter";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CashFlowChart from "@/components/charts/cash-flow-chart";

export default function Dashboard() {
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
    <div className="p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl text-gray-600 font-league">
            {getGreeting()}, {user?.businessName}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base hover-lift">
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="btn-orange flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span className="font-league">Catat Transaksi</span>
          </button>
          <Button variant="outline" className="flex items-center space-x-2 font-league border-[#f29716] text-[#f29716] hover:bg-[#f29716] hover:text-white">
            <FileText className="h-4 w-4" />
            <span>Lihat Laporan</span>
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card - Special styling per brand guidelines */}
        <div className="balance-card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-league">Saldo Kas</p>
              <p className="text-3xl font-bold text-white font-league">
                {formatCurrency(dashboardStats?.cashBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="badge-yellow">Aktif</span>
            <p className="text-white/60 text-xs font-league">{user?.businessName}</p>
          </div>
        </div>

        {/* Income Card */}
        <div className="card-base hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-league">Pemasukan Minggu Ini</p>
              <p className="text-2xl font-bold text-success font-league">
                {formatCurrency(dashboardStats?.weeklyIncome || 0)}
              </p>
            </div>
            <div className="icon-circle bg-green-100">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-success" />
              <span className="text-xs text-gray-600 font-league">Naik dari minggu lalu</span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="card-base hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-league">Pengeluaran Minggu Ini</p>
              <p className="text-2xl font-bold text-red-600 font-league">
                {formatCurrency(dashboardStats?.weeklyExpenses || 0)}
              </p>
            </div>
            <div className="icon-circle bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-red-600" />
              <span className="text-xs text-gray-600 font-league">Dari minggu lalu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit/Loss & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base hover-lift">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-league">Laba/Rugi Minggu Ini</h3>
          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold font-league ${
              (dashboardStats?.weeklyProfit || 0) >= 0 ? 'text-success' : 'text-red-600'
            }`}>
              {formatCurrency(dashboardStats?.weeklyProfit || 0)}
            </div>
            <div className="text-sm text-gray-600 font-league">
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
        </div>

        <div className="card-base hover-lift h-40">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-league">Arus Kas 7 Hari</h3>
          <div className="h-32">
            <CashFlowChart data={dashboardStats?.cashFlowData || []} />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights?.insight && (
        <div className="card-base hover-lift bg-gradient-to-r from-[#f29716]/5 to-[#ffde32]/10 border-[#f29716]/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-[#f29716]/10 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-[#f29716]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2 font-league">Insight AI Mingguan</h4>
              <p className="text-gray-700 font-league leading-relaxed">{aiInsights.insight}</p>
              <div className="mt-3">
                <span className="badge-yellow">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions - Latest Spendings List */}
      <div className="card-base hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 font-league">Transaksi Terbaru</h3>
          <Button variant="ghost" size="sm" className="text-[#f29716] hover:bg-[#f29716]/10 font-league">
            Lihat Semua
          </Button>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboardStats?.recentTransactions?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-league">Belum ada transaksi</p>
              <button 
                className="btn-orange mt-4"
                onClick={() => setShowAddTransaction(true)}
              >
                Tambah Transaksi Pertama
              </button>
            </div>
          ) : (
            dashboardStats?.recentTransactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="icon-circle">
                    {transaction.type === 'income' ? (
                      <ArrowUp className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-league">{transaction.description}</p>
                    <p className="text-sm text-gray-600 font-league">{formatDateTime(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold font-league ${
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
      </div>

      <AddTransactionModal 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
      />
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Download, TrendingUp, TrendingDown, ChartLine, Percent } from "lucide-react";
import IncomeExpenseChart from "@/components/charts/income-expense-chart";
import ExpenseCategoryChart from "@/components/charts/expense-category-chart";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports/financial", dateRange.startDate, dateRange.endDate],
    queryFn: () => api.getFinancialReport(dateRange.startDate, dateRange.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisWeek':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });
  };

  const downloadPDF = async () => {
    // Implementation for PDF download would go here
    // For now, we'll show a toast
    alert("Fitur download PDF akan segera tersedia");
  };

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Analisis mendalam tentang kinerja keuangan usaha Anda</p>
        </div>
        <Button onClick={downloadPDF} className="bg-red-600 hover:bg-red-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode
              </label>
              <Select onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                  <SelectItem value="thisWeek">Minggu Ini</SelectItem>
                  <SelectItem value="last3Months">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="thisYear">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pemasukan</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(reportData?.totalIncome || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(reportData?.totalExpenses || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Laba Bersih</p>
                <p className={`text-xl font-bold ${
                  (reportData?.netProfit || 0) >= 0 ? 'text-primary' : 'text-red-600'
                }`}>
                  {formatCurrency(reportData?.netProfit || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ChartLine className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Margin Keuntungan</p>
                <p className="text-xl font-bold text-gray-900">
                  {(reportData?.profitMargin || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart 
              income={reportData?.totalIncome || 0}
              expenses={reportData?.totalExpenses || 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart data={reportData?.expensesByCategory || []} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kategori Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData?.incomeByCategory?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tidak ada data pemasukan</p>
              ) : (
                reportData?.incomeByCategory?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.category}</p>
                      <p className="text-sm text-gray-600">
                        {reportData.totalIncome > 0 
                          ? `${((item.amount / reportData.totalIncome) * 100).toFixed(1)}% dari total pemasukan`
                          : '0% dari total pemasukan'
                        }
                      </p>
                    </div>
                    <p className="font-semibold text-success">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData?.expensesByCategory?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tidak ada data pengeluaran</p>
              ) : (
                reportData?.expensesByCategory?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.category}</p>
                      <p className="text-sm text-gray-600">
                        {item.percentage.toFixed(1)}% dari total pengeluaran
                      </p>
                    </div>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

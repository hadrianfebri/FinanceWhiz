import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Download, TrendingUp, TrendingDown, ChartLine, Percent, Building2, X } from "lucide-react";
import IncomeExpenseChart from "@/components/charts/income-expense-chart";
import ExpenseCategoryChart from "@/components/charts/expense-category-chart";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");

  const { data: outlets } = useQuery({
    queryKey: ["/api/outlets"],
    queryFn: () => api.getOutlets(),
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports/financial", dateRange.startDate, dateRange.endDate, selectedOutlet],
    queryFn: () => api.getFinancialReport(dateRange.startDate, dateRange.endDate, selectedOutlet),
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

  const handleDownloadPDF = () => {
    if (!reportData) {
      return;
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Keuangan FinanceWhiz.AI</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #f29716; font-size: 24px; font-weight: bold; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .income { color: #22c55e; }
          .expense { color: #ef4444; }
          .profit { color: #04474f; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f8f9fa; }
          .footer { text-align: center; margin-top: 40px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FinanceWhiz.AI</div>
          <h2>Laporan Keuangan</h2>
          <p>Periode: ${new Date(dateRange.startDate).toLocaleDateString('id-ID')} - ${new Date(dateRange.endDate).toLocaleDateString('id-ID')}</p>
        </div>

        <div class="summary">
          <div class="metric">
            <div class="metric-value income">${formatCurrency(reportData.totalIncome)}</div>
            <div>Total Pemasukan</div>
          </div>
          <div class="metric">
            <div class="metric-value expense">${formatCurrency(reportData.totalExpenses)}</div>
            <div>Total Pengeluaran</div>
          </div>
          <div class="metric">
            <div class="metric-value profit">${formatCurrency(reportData.netProfit)}</div>
            <div>Laba Bersih</div>
          </div>
          <div class="metric">
            <div class="metric-value">${reportData.profitMargin.toFixed(1)}%</div>
            <div>Margin Keuntungan</div>
          </div>
        </div>

        <h3>Pemasukan per Kategori</h3>
        <table class="table">
          <thead>
            <tr><th>Kategori</th><th>Jumlah</th><th>Persentase</th></tr>
          </thead>
          <tbody>
            ${reportData.incomeByCategory.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${((item.amount / reportData.totalIncome) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Pengeluaran per Kategori</h3>
        <table class="table">
          <thead>
            <tr><th>Kategori</th><th>Jumlah</th><th>Persentase</th></tr>
          </thead>
          <tbody>
            ${reportData.expensesByCategory.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Laporan dibuat pada ${new Date().toLocaleString('id-ID')}</p>
          <p>FinanceWhiz.AI - Sistem Manajemen Keuangan UMKM</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-keuangan-${dateRange.startDate}-${dateRange.endDate}.html`;
    link.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-foreground font-league">Laporan Keuangan</h1>
          <p className="text-muted-foreground">Analisis mendalam tentang kinerja keuangan usaha Anda</p>
          
          {/* Outlet Filter Indicator */}
          {selectedOutlet !== "all" && (
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="bg-[#f29716]/10 border-[#f29716] text-[#f29716]">
                <Building2 className="h-3 w-3 mr-1" />
                {selectedOutlet === "pusat" ? "Pusat Saja" : 
                 outlets?.find((o: any) => o.id.toString() === selectedOutlet)?.name || "Outlet"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOutlet("all")}
                className="h-6 w-6 p-0 text-gray-400 hover:text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#fafafa] mb-2">
                Outlet
              </label>
              <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Outlet</SelectItem>
                  <SelectItem value="pusat">Pusat Saja</SelectItem>
                  {outlets?.map((outlet: any) => (
                    <SelectItem key={outlet.id} value={outlet.id.toString()}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#fafafa] mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-[#fafafa] mb-2">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#fafafa] mb-2">
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
                <p className="text-muted-foreground text-sm">Total Pemasukan</p>
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
                <p className="text-muted-foreground text-sm">Total Pengeluaran</p>
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
                <p className="text-muted-foreground text-sm">Laba Bersih</p>
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
                <p className="text-muted-foreground text-sm">Margin Keuntungan</p>
                <p className="text-xl font-bold text-foreground">
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
                <p className="text-muted-foreground text-center py-4">Tidak ada data pemasukan</p>
              ) : (
                reportData?.incomeByCategory?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
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
                <p className="text-muted-foreground text-center py-4">Tidak ada data pengeluaran</p>
              ) : (
                reportData?.expensesByCategory?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
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

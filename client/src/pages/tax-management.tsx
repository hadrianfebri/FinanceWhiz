import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Calculator, Download, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';

export default function TaxManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-Q2');
  const queryClient = useQueryClient();

  // Mock data for tax reports
  const taxData = [
    {
      id: 1,
      period: '2024-Q2',
      totalRevenue: 125000000,
      taxableIncome: 120000000,
      taxAmount: 600000,
      taxRate: 0.005,
      status: 'submitted',
      submissionDate: '2024-07-15',
      dueDate: '2024-07-31'
    },
    {
      id: 2,
      period: '2024-Q1',
      totalRevenue: 98000000,
      taxableIncome: 95000000,
      taxAmount: 475000,
      taxRate: 0.005,
      status: 'paid',
      submissionDate: '2024-04-15',
      dueDate: '2024-04-30'
    },
    {
      id: 3,
      period: '2023-Q4',
      totalRevenue: 110000000,
      taxableIncome: 105000000,
      taxAmount: 525000,
      taxRate: 0.005,
      status: 'paid',
      submissionDate: '2024-01-15',
      dueDate: '2024-01-31'
    }
  ];

  const taxSummary = {
    currentQuarterTax: 600000,
    yearToDateTax: 1075000,
    upcomingDeadline: '2024-10-31',
    complianceStatus: 'compliant'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Disubmit</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Terlambat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pajak</h1>
          <p className="text-gray-600 mt-1">Kelola pelaporan dan pembayaran pajak bisnis</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Laporan
          </Button>
          <Button className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Buat Laporan Pajak
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pajak Kuartal Ini</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(taxSummary.currentQuarterTax)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pajak Year-to-Date</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(taxSummary.yearToDateTax)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deadline Berikutnya</p>
                <p className="text-2xl font-bold text-orange-600">{formatDate(taxSummary.upcomingDeadline)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status Kepatuhan</p>
                <p className="text-2xl font-bold text-green-600">Compliant</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Quarter Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#f29716]" />
            Perhitungan Pajak Q2 2024
          </CardTitle>
          <CardDescription>Perhitungan PPh Final 0.5% untuk UMKM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Omzet</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(125000000)}</p>
              <p className="text-sm text-gray-500">April - Juni 2024</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Penghasilan Kena Pajak</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(120000000)}</p>
              <p className="text-sm text-gray-500">Setelah pengurangan</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">PPh Final (0.5%)</p>
              <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(600000)}</p>
              <p className="text-sm text-gray-500">Wajib dibayar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Pelaporan Pajak</CardTitle>
              <CardDescription>Histori pelaporan dan pembayaran pajak</CardDescription>
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="2024-Q2">Q2 2024</option>
              <option value="2024-Q1">Q1 2024</option>
              <option value="2023-Q4">Q4 2023</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Periode</th>
                  <th className="text-right p-3 font-medium text-gray-900">Total Omzet</th>
                  <th className="text-right p-3 font-medium text-gray-900">Penghasilan Kena Pajak</th>
                  <th className="text-right p-3 font-medium text-gray-900">Pajak</th>
                  <th className="text-center p-3 font-medium text-gray-900">Status</th>
                  <th className="text-center p-3 font-medium text-gray-900">Tanggal Submit</th>
                  <th className="text-center p-3 font-medium text-gray-900">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {taxData.map((tax) => (
                  <tr key={tax.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{tax.period}</td>
                    <td className="p-3 text-right text-gray-900">{formatCurrency(tax.totalRevenue)}</td>
                    <td className="p-3 text-right text-gray-900">{formatCurrency(tax.taxableIncome)}</td>
                    <td className="p-3 text-right font-semibold text-[#f29716]">{formatCurrency(tax.taxAmount)}</td>
                    <td className="p-3 text-center">{getStatusBadge(tax.status)}</td>
                    <td className="p-3 text-center text-gray-600">{formatDate(tax.submissionDate)}</td>
                    <td className="p-3 text-center text-gray-600">{formatDate(tax.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Pengingat Pajak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pelaporan PPh Final Q3 2024</p>
                <p className="text-sm text-gray-600">Deadline: 31 Oktober 2024</p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">92 hari lagi</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pembayaran Pajak Q2 2024</p>
                <p className="text-sm text-gray-600">Status: Menunggu konfirmasi pembayaran</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculator Helper */}
      <Card>
        <CardHeader>
          <CardTitle>Kalkulator Pajak UMKM</CardTitle>
          <CardDescription>Hitung estimasi PPh Final 0.5% untuk perencanaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Omzet Bulanan</label>
              <input 
                type="number" 
                placeholder="45000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pengurangan (%)</label>
              <input 
                type="number" 
                placeholder="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#f29716] hover:bg-[#d4820a]">
                Hitung Pajak
              </Button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Estimasi PPh Final per bulan:</p>
            <p className="text-2xl font-bold text-[#f29716]">{formatCurrency(213750)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
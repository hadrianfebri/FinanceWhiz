import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, Users, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';

export default function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-06');
  const queryClient = useQueryClient();

  // Mock data for payroll records
  const payrollData = [
    {
      id: 1,
      employeeName: 'Ahmad Rizki',
      position: 'Kasir',
      outletName: 'Cabang Utama',
      baseSalary: 3500000,
      bonus: 200000,
      deduction: 150000,
      totalAmount: 3550000,
      payPeriod: '2024-06',
      status: 'paid',
      payDate: '2024-06-30'
    },
    {
      id: 2,
      employeeName: 'Siti Nurhaliza',
      position: 'Manager',
      outletName: 'Cabang Mall',
      baseSalary: 6000000,
      bonus: 500000,
      deduction: 300000,
      totalAmount: 6200000,
      payPeriod: '2024-06',
      status: 'pending',
      payDate: null
    },
    {
      id: 3,
      employeeName: 'Budi Santoso',
      position: 'Staff Gudang',
      outletName: 'Cabang Utama',
      baseSalary: 3000000,
      bonus: 100000,
      deduction: 100000,
      totalAmount: 3000000,
      payPeriod: '2024-06',
      status: 'paid',
      payDate: '2024-06-30'
    }
  ];

  const payrollSummary = {
    totalEmployees: 15,
    totalPayroll: 52750000,
    pendingPayments: 3,
    paidPayments: 12
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Proses</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Payroll</h1>
          <p className="text-gray-600 mt-1">Kelola penggajian karyawan dan tunjangan</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Proses Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollSummary.totalPayroll)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pembayaran Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{payrollSummary.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                <p className="text-2xl font-bold text-green-600">{payrollSummary.paidPayments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Payroll - Juni 2024</CardTitle>
              <CardDescription>Daftar penggajian karyawan bulan ini</CardDescription>
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="2024-06">Juni 2024</option>
              <option value="2024-05">Mei 2024</option>
              <option value="2024-04">April 2024</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Karyawan</th>
                  <th className="text-left p-3 font-medium text-gray-900">Posisi</th>
                  <th className="text-left p-3 font-medium text-gray-900">Outlet</th>
                  <th className="text-right p-3 font-medium text-gray-900">Gaji Pokok</th>
                  <th className="text-right p-3 font-medium text-gray-900">Bonus</th>
                  <th className="text-right p-3 font-medium text-gray-900">Potongan</th>
                  <th className="text-right p-3 font-medium text-gray-900">Total</th>
                  <th className="text-center p-3 font-medium text-gray-900">Status</th>
                  <th className="text-center p-3 font-medium text-gray-900">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((payroll) => (
                  <tr key={payroll.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{payroll.employeeName}</div>
                    </td>
                    <td className="p-3 text-gray-600">{payroll.position}</td>
                    <td className="p-3 text-gray-600">{payroll.outletName}</td>
                    <td className="p-3 text-right text-gray-900">{formatCurrency(payroll.baseSalary)}</td>
                    <td className="p-3 text-right text-green-600">{formatCurrency(payroll.bonus)}</td>
                    <td className="p-3 text-right text-red-600">{formatCurrency(payroll.deduction)}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(payroll.totalAmount)}</td>
                    <td className="p-3 text-center">{getStatusBadge(payroll.status)}</td>
                    <td className="p-3 text-center text-gray-600">
                      {payroll.payDate ? formatDate(payroll.payDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#f29716]" />
            Pengingat Payroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Payroll Juli 2024</p>
                <p className="text-sm text-gray-600">Deadline pembayaran: 31 Juli 2024</p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">7 hari lagi</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Review Bonus Karyawan</p>
                <p className="text-sm text-gray-600">Evaluasi bonus berdasarkan performa</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">14 hari lagi</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
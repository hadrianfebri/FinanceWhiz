import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, DollarSign, Users, Download, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-06');
  const [showAddPayroll, setShowAddPayroll] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    baseSalary: '',
    bonus: '',
    deduction: '',
    payPeriod: selectedPeriod,
    notes: ''
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get payroll data from API
  const { data: payrollData = [], isLoading: isLoadingPayroll } = useQuery({
    queryKey: ['/api/payroll', selectedPeriod],
    queryFn: () => fetch(`/api/payroll?period=${selectedPeriod}`).then(res => res.json())
  });

  // Get employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => fetch('/api/employees').then(res => res.json())
  });

  // Get outlets for reference
  const { data: outlets = [] } = useQuery({
    queryKey: ['/api/outlets'],
    queryFn: () => fetch('/api/outlets').then(res => res.json())
  });

  // Calculate payroll summary from real data
  const payrollSummary = {
    totalEmployees: employees.length || 0,
    totalPayroll: payrollData.reduce((sum: number, p: any) => sum + (parseFloat(p.totalAmount) || 0), 0),
    pendingPayments: payrollData.filter((p: any) => p.status === 'pending').length,
    paidPayments: payrollData.filter((p: any) => p.status === 'paid').length
  };

  // Create payroll mutation
  const createPayrollMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      setShowAddPayroll(false);
      setFormData({
        employeeId: '',
        baseSalary: '',
        bonus: '',
        deduction: '',
        payPeriod: selectedPeriod,
        notes: ''
      });
      toast({
        title: "Berhasil",
        description: "Data payroll berhasil ditambahkan"
      });
    }
  });

  // Update payroll status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      fetch(`/api/payroll/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      toast({
        title: "Berhasil",
        description: "Status payroll berhasil diupdate"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.baseSalary) {
      toast({
        title: "Error",
        description: "Mohon lengkapi data yang diperlukan",
        variant: "destructive"
      });
      return;
    }
    createPayrollMutation.mutate(formData);
  };

  const handleStatusUpdate = (payrollId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: payrollId, status: newStatus });
  };

  const exportPayrollData = () => {
    const csvContent = [
      ['Nama Karyawan', 'Posisi', 'Outlet', 'Gaji Pokok', 'Bonus', 'Potongan', 'Total', 'Status', 'Tanggal Bayar'],
      ...payrollData.map((payroll: any) => [
        payroll.employeeName,
        payroll.position,
        payroll.outletName,
        payroll.baseSalary,
        payroll.bonus,
        payroll.deduction,
        payroll.totalAmount,
        payroll.status,
        payroll.payDate || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-${selectedPeriod}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={exportPayrollData}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2"
            onClick={() => setShowAddPayroll(true)}
          >
            <Plus className="h-4 w-4" />
            Tambah Payroll
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
                  <th className="text-center p-3 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPayroll ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">
                      Loading payroll data...
                    </td>
                  </tr>
                ) : payrollData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">
                      Belum ada data payroll untuk periode ini
                    </td>
                  </tr>
                ) : (
                  payrollData.map((payroll: any) => (
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
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {payroll.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                              onClick={() => handleStatusUpdate(payroll.id, 'paid')}
                            >
                              Bayar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* Add Payroll Modal */}
      <Dialog open={showAddPayroll} onOpenChange={setShowAddPayroll}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-league">Tambah Data Payroll</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employeeId" className="font-league">Karyawan</Label>
              <Select 
                value={formData.employeeId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih karyawan" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="baseSalary" className="font-league">Gaji Pokok</Label>
              <Input
                id="baseSalary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                placeholder="5000000"
                required
              />
            </div>

            <div>
              <Label htmlFor="bonus" className="font-league">Bonus</Label>
              <Input
                id="bonus"
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="deduction" className="font-league">Potongan</Label>
              <Input
                id="deduction"
                type="number"
                value={formData.deduction}
                onChange={(e) => setFormData(prev => ({ ...prev, deduction: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="payPeriod" className="font-league">Periode Gaji</Label>
              <Input
                id="payPeriod"
                value={formData.payPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                placeholder="2024-06"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="font-league">Catatan</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowAddPayroll(false)}
                className="font-league"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-[#f29716] hover:bg-[#d4820a] font-league"
                disabled={createPayrollMutation.isPending}
              >
                {createPayrollMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-league">Detail Payroll</DialogTitle>
          </DialogHeader>
          
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-league text-gray-600">Nama Karyawan</Label>
                  <p className="font-medium">{selectedPayroll.employeeName}</p>
                </div>
                <div>
                  <Label className="font-league text-gray-600">Posisi</Label>
                  <p className="font-medium">{selectedPayroll.position}</p>
                </div>
                <div>
                  <Label className="font-league text-gray-600">Outlet</Label>
                  <p className="font-medium">{selectedPayroll.outletName}</p>
                </div>
                <div>
                  <Label className="font-league text-gray-600">Periode</Label>
                  <p className="font-medium">{selectedPayroll.payPeriod}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-league text-gray-600 mb-3 block">Rincian Gaji</Label>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gaji Pokok:</span>
                    <span className="font-medium">{formatCurrency(selectedPayroll.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Bonus:</span>
                    <span className="font-medium">+{formatCurrency(selectedPayroll.bonus)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Potongan:</span>
                    <span className="font-medium">-{formatCurrency(selectedPayroll.deduction)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedPayroll.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-league text-gray-600">Status Pembayaran</Label>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(selectedPayroll.status)}
                  {selectedPayroll.payDate && (
                    <span className="text-sm text-gray-500">
                      Dibayar: {formatDate(selectedPayroll.payDate)}
                    </span>
                  )}
                </div>
              </div>

              {selectedPayroll.notes && (
                <div className="border-t pt-4">
                  <Label className="font-league text-gray-600">Catatan</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedPayroll.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailModal(false)}
                  className="font-league"
                >
                  Tutup
                </Button>
                {selectedPayroll.status === 'pending' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 font-league"
                    onClick={() => {
                      handleStatusUpdate(selectedPayroll.id, 'paid');
                      setShowDetailModal(false);
                    }}
                  >
                    Tandai Dibayar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, DollarSign, Users, Download, Edit, Trash2, Eye, FileText, Send, Mail } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Payroll() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-06');
  const [showAddPayroll, setShowAddPayroll] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [employeeFilterPosition, setEmployeeFilterPosition] = useState('');
  const [showAddNewEmployee, setShowAddNewEmployee] = useState(false);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    baseSalary: '',
    outletId: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    baseSalary: '',
    bonus: '',
    deduction: '',
    payPeriod: selectedPeriod,
    notes: ''
  });
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    baseSalary: '',
    outletId: ''
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get payroll data from API
  const { data: payrollData = [], isLoading: isLoadingPayroll } = useQuery({
    queryKey: ['/api/payroll', selectedPeriod],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payroll?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payroll data');
      }
      return response.json();
    }
  });

  // Get employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    }
  });

  // Get outlets for reference
  const { data: outlets = [] } = useQuery({
    queryKey: ['/api/outlets'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/outlets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch outlets');
      }
      return response.json();
    }
  });

  // Calculate payroll summary from real data
  const payrollSummary = {
    totalEmployees: employees.length || 0,
    totalPayroll: Array.isArray(payrollData) ? payrollData.reduce((sum: number, p: any) => sum + (parseFloat(p.totalAmount) || 0), 0) : 0,
    pendingPayments: Array.isArray(payrollData) ? payrollData.filter((p: any) => p.status === 'pending').length : 0,
    paidPayments: Array.isArray(payrollData) ? payrollData.filter((p: any) => p.status === 'paid').length : 0
  };

  // Create payroll mutation
  const createPayrollMutation = useMutation({
    mutationFn: (data: any) => {
      const token = localStorage.getItem('auth_token');
      return fetch('/api/payroll', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }).then(res => res.json());
    },
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
    mutationFn: ({ id, status }: { id: number, status: string }) => {
      const token = localStorage.getItem('auth_token');
      return fetch(`/api/payroll/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      toast({
        title: "Berhasil",
        description: "Status payroll berhasil diupdate"
      });
    }
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (data: any) => api.createEmployee(data),
    onSuccess: () => {
      toast({
        title: "Karyawan Berhasil Ditambahkan",
        description: "Data karyawan baru telah tersimpan"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setShowAddEmployee(false);
      setShowAddNewEmployee(false);
      resetEmployeeForm();
      resetNewEmployeeForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menambahkan Karyawan",
        description: error.message,
        variant: "destructive"
      });
    }
  });





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

  const resetEmployeeForm = () => {
    setEmployeeData({
      name: '',
      email: '',
      phone: '',
      position: '',
      baseSalary: '',
      outletId: ''
    });
  };

  const resetNewEmployeeForm = () => {
    setEmployeeFormData({
      name: '',
      position: '',
      email: '',
      phone: '',
      baseSalary: '',
      outletId: 'all'
    });
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeFormData.name.trim() || !employeeFormData.email.trim()) {
      toast({
        title: "Error",
        description: "Nama dan email karyawan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const newEmployeeData = {
      name: employeeFormData.name,
      position: employeeFormData.position,
      email: employeeFormData.email,
      phone: employeeFormData.phone,
      baseSalary: parseFloat(employeeFormData.baseSalary) || 0,
      outletId: employeeFormData.outletId && employeeFormData.outletId !== 'all' ? parseInt(employeeFormData.outletId) : null
    };

    createEmployeeMutation.mutate(newEmployeeData);
  };

  const handleAddPosition = () => {
    if (!newPositionName.trim()) {
      toast({
        title: "Error",
        description: "Nama jabatan tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // Add position to employee form data and close modal
    setEmployeeFormData(prev => ({ ...prev, position: newPositionName }));
    setShowAddPosition(false);
    setNewPositionName('');
    
    toast({
      title: "Berhasil",
      description: `Jabatan "${newPositionName}" berhasil ditambahkan`,
    });
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeData.name.trim() || !employeeData.email.trim()) {
      toast({
        title: "Error",
        description: "Nama dan email karyawan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createEmployeeMutation.mutate({
      ...employeeData,
      baseSalary: parseFloat(employeeData.baseSalary) || 3500000,
      outletId: employeeData.outletId ? parseInt(employeeData.outletId) : 1
    });
  };

  // Handler untuk auto-fill gaji pokok ketika karyawan dipilih
  const handleEmployeeSelect = (employeeId: string) => {
    setFormData(prev => ({ ...prev, employeeId }));
    
    // Cari data karyawan yang dipilih
    const selectedEmployee = employees.find((emp: any) => emp.id.toString() === employeeId);
    if (selectedEmployee && selectedEmployee.baseSalary) {
      // Auto-fill gaji pokok dari data karyawan
      setFormData(prev => ({ 
        ...prev, 
        employeeId,
        baseSalary: selectedEmployee.baseSalary.toString()
      }));
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.baseSalary) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createPayrollMutation.mutate(formData);
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
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

  // Filter payroll data based on search and position filter
  const filteredPayrollData = payrollData?.filter((payroll: any) => {
    const matchesSearch = !searchTerm || 
      payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.outletName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = !filterPosition || filterPosition === 'all' || 
      payroll.position?.toLowerCase() === filterPosition.toLowerCase();
    
    return matchesSearch && matchesPosition;
  }) || [];

  // Get unique positions for filter dropdown
  const uniquePositions = Array.from(new Set(payrollData?.map((p: any) => p.position).filter(Boolean))) || [];

  // Get unique employee positions for employee filter
  const uniqueEmployeePositions = Array.from(new Set(employees?.map((emp: any) => emp.position).filter(Boolean))) || [];

  // Filter employees based on search and position
  const filteredEmployees = employees?.filter((employee: any) => {
    const matchesSearch = !employeeSearchTerm || 
      employee.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    
    const matchesPosition = !employeeFilterPosition || employeeFilterPosition === 'all_positions' || employee.position === employeeFilterPosition;
    
    return matchesSearch && matchesPosition;
  }) || [];

  // Generate professional payslip PDF
  const generatePayslip = (payroll: any) => {
    const payslipHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Slip Gaji - ${payroll.employeeName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            background: #f8fafc; 
            padding: 20px; 
            color: #1e293b;
          }
          .payslip { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #f29716 0%, #d4820a 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .company-name { 
            font-size: 24px; 
            font-weight: 700; 
            margin-bottom: 8px; 
          }
          .document-title { 
            font-size: 18px; 
            font-weight: 500; 
            opacity: 0.9; 
          }
          .content { 
            padding: 30px; 
          }
          .employee-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px; 
            padding: 20px; 
            background: #f8fafc; 
            border-radius: 8px; 
          }
          .info-group h4 { 
            color: #475569; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 6px; 
          }
          .info-group p { 
            font-size: 16px; 
            font-weight: 500; 
            color: #1e293b; 
          }
          .salary-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
          }
          .salary-table th { 
            background: #f1f5f9; 
            padding: 16px; 
            text-align: left; 
            font-weight: 600; 
            color: #475569; 
            font-size: 14px; 
            border-bottom: 2px solid #e2e8f0; 
          }
          .salary-table td { 
            padding: 16px; 
            border-bottom: 1px solid #e2e8f0; 
            font-size: 15px; 
          }
          .amount { 
            font-weight: 600; 
            text-align: right; 
          }
          .total-row { 
            background: #f8fafc; 
            font-weight: 700; 
            font-size: 16px; 
          }
          .total-row .amount { 
            color: #059669; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8fafc; 
            border-top: 1px solid #e2e8f0; 
            color: #64748b; 
            font-size: 12px; 
          }
          .signature-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin: 30px 0; 
            text-align: center; 
          }
          .signature-box { 
            padding: 20px; 
          }
          .signature-line { 
            border-top: 1px solid #cbd5e1; 
            margin-top: 50px; 
            padding-top: 8px; 
            font-weight: 500; 
          }
          @media print {
            body { background: white; padding: 0; }
            .payslip { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <div class="company-name">Toko Berkah</div>
            <div class="document-title">Slip Gaji Karyawan</div>
          </div>
          
          <div class="content">
            <div class="employee-info">
              <div class="info-group">
                <h4>Nama Karyawan</h4>
                <p>${payroll.employeeName}</p>
              </div>
              <div class="info-group">
                <h4>Jabatan</h4>
                <p>${payroll.position || 'Staff'}</p>
              </div>
              <div class="info-group">
                <h4>Periode Gaji</h4>
                <p>${payroll.payPeriod}</p>
              </div>
              <div class="info-group">
                <h4>Tanggal Pembayaran</h4>
                <p>${payroll.payDate ? new Date(payroll.payDate).toLocaleDateString('id-ID') : 'Belum dibayar'}</p>
              </div>
            </div>

            <table class="salary-table">
              <thead>
                <tr>
                  <th>Komponen Gaji</th>
                  <th class="amount">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gaji Pokok</td>
                  <td class="amount">${formatCurrency(payroll.baseSalary)}</td>
                </tr>
                <tr>
                  <td>Tunjangan & Bonus</td>
                  <td class="amount">${formatCurrency(payroll.bonus || 0)}</td>
                </tr>
                <tr>
                  <td>Potongan</td>
                  <td class="amount">-${formatCurrency(payroll.deduction || 0)}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>Total Gaji Bersih</strong></td>
                  <td class="amount">${formatCurrency(payroll.totalAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">
                  HRD / Finance
                </div>
              </div>
              <div class="signature-box">
                <div class="signature-line">
                  ${payroll.employeeName}
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Dokumen ini dibuat secara otomatis oleh sistem Toko Berkah</p>
            <p>Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(payslipHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Send payslip via email
  const sendPayslipEmail = async (payroll: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payroll/send-payslip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payrollId: payroll.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Berhasil",
          description: result.message || `Slip gaji berhasil dikirim ke ${payroll.employeeName}`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send payslip');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengirim slip gaji. Pastikan email karyawan sudah benar.",
        variant: "destructive"
      });
    }
  };

  // View employee details
  const viewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setEmployeeFormData({
      name: employee.name || '',
      position: employee.position || '',
      email: employee.email || '',
      phone: employee.phone || '',
      baseSalary: employee.baseSalary?.toString() || '',
      outletId: employee.outletId?.toString() || 'all'
    });
    setIsEditingEmployee(false);
    setShowEmployeeModal(true);
  };

  // Edit employee
  const editEmployee = () => {
    setIsEditingEmployee(true);
  };

  // Save employee changes
  const saveEmployeeChanges = async () => {
    if (!selectedEmployee) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: employeeFormData.name,
          position: employeeFormData.position,
          email: employeeFormData.email,
          phone: employeeFormData.phone,
          baseSalary: parseFloat(employeeFormData.baseSalary) || 0,
          outletId: employeeFormData.outletId && employeeFormData.outletId !== 'all' ? parseInt(employeeFormData.outletId) : null
        })
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Data karyawan berhasil diperbarui"
        });
        setIsEditingEmployee(false);
        setShowEmployeeModal(false);
        queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      } else {
        throw new Error('Failed to update employee');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data karyawan",
        variant: "destructive"
      });
    }
  };

  // Cancel employee edit
  const cancelEmployeeEdit = () => {
    if (!selectedEmployee) return;
    
    setEmployeeFormData({
      name: selectedEmployee.name || '',
      position: selectedEmployee.position || '',
      email: selectedEmployee.email || '',
      phone: selectedEmployee.phone || '',
      baseSalary: selectedEmployee.baseSalary?.toString() || '',
      outletId: selectedEmployee.outletId?.toString() || 'all'
    });
    setIsEditingEmployee(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Payroll</h1>
          <p className="text-muted-foreground mt-1">Kelola penggajian karyawan dan tunjangan</p>
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
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white flex items-center gap-2"
            onClick={() => setShowAddEmployee(true)}
          >
            <Users className="h-4 w-4" />
            Kelola Karyawan
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Cari karyawan, jabatan, atau outlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Jabatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jabatan</SelectItem>
            {uniquePositions.map((position) => (
              <SelectItem key={position as string} value={position as string}>
                {position as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || (filterPosition && filterPosition !== 'all')) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterPosition('all');
            }}
            className="w-full sm:w-auto"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Karyawan</p>
                <p className="text-2xl font-bold text-foreground">{payrollSummary.totalEmployees}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(payrollSummary.totalPayroll)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Pembayaran Pending</p>
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
                <p className="text-sm font-medium text-muted-foreground">Sudah Dibayar</p>
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
                  <th className="text-left p-3 font-medium text-foreground">Karyawan</th>
                  <th className="text-left p-3 font-medium text-foreground">Posisi</th>
                  <th className="text-left p-3 font-medium text-foreground">Outlet</th>
                  <th className="text-right p-3 font-medium text-foreground">Gaji Pokok</th>
                  <th className="text-right p-3 font-medium text-foreground">Bonus</th>
                  <th className="text-right p-3 font-medium text-foreground">Potongan</th>
                  <th className="text-right p-3 font-medium text-foreground">Total</th>
                  <th className="text-center p-3 font-medium text-foreground">Status</th>
                  <th className="text-center p-3 font-medium text-foreground">Tanggal Bayar</th>
                  <th className="text-center p-3 font-medium text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPayroll ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      Loading payroll data...
                    </td>
                  </tr>
                ) : filteredPayrollData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      {searchTerm || filterPosition ? "Tidak ada data yang sesuai dengan filter" : "Belum ada data payroll untuk periode ini"}
                    </td>
                  </tr>
                ) : (
                  filteredPayrollData.map((payroll: any) => (
                    <tr key={payroll.id} className="border-b hover:bg-background">
                      <td className="p-3">
                        <div className="font-medium text-foreground">{payroll.employeeName}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{payroll.position}</td>
                      <td className="p-3 text-muted-foreground">{payroll.outletName}</td>
                      <td className="p-3 text-right text-foreground">{formatCurrency(payroll.baseSalary)}</td>
                      <td className="p-3 text-right text-green-600">{formatCurrency(payroll.bonus)}</td>
                      <td className="p-3 text-right text-red-600">{formatCurrency(payroll.deduction)}</td>
                      <td className="p-3 text-right font-semibold text-foreground">{formatCurrency(payroll.totalAmount)}</td>
                      <td className="p-3 text-center">{getStatusBadge(payroll.status)}</td>
                      <td className="p-3 text-center text-muted-foreground">
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            onClick={() => generatePayslip(payroll)}
                            title="Cetak Slip Gaji"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                            onClick={() => sendPayslipEmail(payroll)}
                            title="Kirim Slip Gaji via Email"
                          >
                            <Mail className="h-4 w-4" />
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
                <p className="font-medium text-foreground">Payroll Juli 2024</p>
                <p className="text-sm text-muted-foreground">Deadline pembayaran: 31 Juli 2024</p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">7 hari lagi</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Review Bonus Karyawan</p>
                <p className="text-sm text-muted-foreground">Evaluasi bonus berdasarkan performa</p>
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
              <div className="space-y-2">
                <Select 
                  value={formData.employeeId} 
                  onValueChange={handleEmployeeSelect}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddEmployee(true)}
                  className="w-full text-[#f29716] border-[#f29716] hover:bg-[#f29716] hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Karyawan Baru
                </Button>
              </div>
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
                  <Label className="font-league text-muted-foreground">Nama Karyawan</Label>
                  <p className="font-medium">{selectedPayroll.employeeName}</p>
                </div>
                <div>
                  <Label className="font-league text-muted-foreground">Posisi</Label>
                  <p className="font-medium">{selectedPayroll.position}</p>
                </div>
                <div>
                  <Label className="font-league text-muted-foreground">Outlet</Label>
                  <p className="font-medium">{selectedPayroll.outletName}</p>
                </div>
                <div>
                  <Label className="font-league text-muted-foreground">Periode</Label>
                  <p className="font-medium">{selectedPayroll.payPeriod}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="font-league text-muted-foreground mb-3 block">Rincian Gaji</Label>
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
                <Label className="font-league text-muted-foreground">Status Pembayaran</Label>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(selectedPayroll.status)}
                  {selectedPayroll.payDate && (
                    <span className="text-sm text-muted-foreground">
                      Dibayar: {formatDate(selectedPayroll.payDate)}
                    </span>
                  )}
                </div>
              </div>

              {selectedPayroll.notes && (
                <div className="border-t pt-4">
                  <Label className="font-league text-muted-foreground">Catatan</Label>
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

      {/* Add Employee Modal */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-league">Tambah Karyawan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <Label htmlFor="employeeName" className="font-league">Nama Karyawan</Label>
              <Input
                id="employeeName"
                value={employeeData.name}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <Label htmlFor="employeeEmail" className="font-league">Email</Label>
              <Input
                id="employeeEmail"
                type="email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="karyawan@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="employeePhone" className="font-league">Nomor Telepon</Label>
              <Input
                id="employeePhone"
                value={employeeData.phone}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="081234567890"
              />
            </div>

            <div>
              <Label htmlFor="employeePosition" className="font-league">Jabatan</Label>
              <Select 
                value={employeeData.position} 
                onValueChange={(value) => setEmployeeData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Kasir">Kasir</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employeeBaseSalary" className="font-league">Gaji Pokok</Label>
              <Input
                id="employeeBaseSalary"
                type="number"
                value={employeeData.baseSalary}
                onChange={(e) => setEmployeeData(prev => ({ ...prev, baseSalary: e.target.value }))}
                placeholder="3500000"
              />
            </div>

            <div>
              <Label htmlFor="employeeOutlet" className="font-league">Outlet</Label>
              <Select 
                value={employeeData.outletId} 
                onValueChange={(value) => setEmployeeData(prev => ({ ...prev, outletId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih outlet" />
                </SelectTrigger>
                <SelectContent>
                  {outlets?.map((outlet: any) => (
                    <SelectItem key={outlet.id} value={outlet.id.toString()}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddEmployee(false);
                  resetEmployeeForm();
                }}
                className="font-league"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="btn-orange font-league"
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending ? 'Menambahkan...' : 'Tambah Karyawan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Management Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingEmployee ? 'Edit Karyawan' : 'Detail Karyawan'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emp-name">Nama Karyawan</Label>
                  <Input
                    id="emp-name"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, name: e.target.value}))}
                    disabled={!isEditingEmployee}
                    className={!isEditingEmployee ? 'bg-background' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="emp-position">Jabatan</Label>
                  <Input
                    id="emp-position"
                    value={employeeFormData.position}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, position: e.target.value}))}
                    disabled={!isEditingEmployee}
                    className={!isEditingEmployee ? 'bg-background' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="emp-email">Email</Label>
                  <Input
                    id="emp-email"
                    type="email"
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, email: e.target.value}))}
                    disabled={!isEditingEmployee}
                    className={!isEditingEmployee ? 'bg-background' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="emp-phone">Telepon</Label>
                  <Input
                    id="emp-phone"
                    value={employeeFormData.phone}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, phone: e.target.value}))}
                    disabled={!isEditingEmployee}
                    className={!isEditingEmployee ? 'bg-background' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="emp-salary">Gaji Pokok</Label>
                  <Input
                    id="emp-salary"
                    type="number"
                    value={employeeFormData.baseSalary}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, baseSalary: e.target.value}))}
                    disabled={!isEditingEmployee}
                    className={!isEditingEmployee ? 'bg-background' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="emp-outlet">Outlet</Label>
                  <Select 
                    value={employeeFormData.outletId} 
                    onValueChange={(value) => setEmployeeFormData(prev => ({...prev, outletId: value}))}
                    disabled={!isEditingEmployee}
                  >
                    <SelectTrigger className={!isEditingEmployee ? 'bg-background' : ''}>
                      <SelectValue placeholder="Pilih outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Outlet</SelectItem>
                      {outlets?.map((outlet: any) => (
                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                          {outlet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {!isEditingEmployee ? (
                  <>
                    <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>
                      Tutup
                    </Button>
                    <Button onClick={editEmployee} className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={cancelEmployeeEdit}>
                      Batal
                    </Button>
                    <Button onClick={saveEmployeeChanges} className="bg-green-600 hover:bg-green-700">
                      Simpan
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee List Modal */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Kelola Karyawan</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 space-y-4 overflow-hidden min-h-0">
            {/* Search and Filter Controls */}
            <div className="flex gap-4 p-4 bg-background rounded-lg flex-shrink-0">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama atau email karyawan..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-48">
                <Select 
                  value={employeeFilterPosition} 
                  onValueChange={setEmployeeFilterPosition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_positions">Semua Jabatan</SelectItem>
                    {uniqueEmployeePositions.map((position: string) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(employeeSearchTerm || employeeFilterPosition) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmployeeSearchTerm('');
                    setEmployeeFilterPosition('');
                  }}
                  className="whitespace-nowrap"
                >
                  Reset Filter
                </Button>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
              <div className="overflow-y-auto h-full max-h-[40vh]">
                <table className="w-full">
                  <thead className="bg-background sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jabatan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gaji Pokok</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          {employeeSearchTerm || employeeFilterPosition 
                            ? "Tidak ada karyawan yang sesuai dengan filter" 
                            : "Belum ada data karyawan"}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee: any) => (
                        <tr key={employee.id} className="hover:bg-background">
                          <td className="px-4 py-3 text-sm text-foreground">{employee.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{employee.position}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{employee.email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatCurrency(employee.baseSalary || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                viewEmployeeDetails(employee);
                                setShowAddEmployee(false);
                              }}
                              className="mr-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 pb-2 border-t bg-card flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredEmployees.length} dari {employees?.length || 0} karyawan
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddNewEmployee(true)}
                className="bg-[#f29716] hover:bg-[#d4820a]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Karyawan
              </Button>
              <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Employee Modal */}
      <Dialog open={showAddNewEmployee} onOpenChange={setShowAddNewEmployee}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tambah Karyawan Baru</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleAddNewEmployee} className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-emp-name">Nama Lengkap *</Label>
                  <Input
                    id="new-emp-name"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-emp-position">Jabatan</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={employeeFormData.position} 
                      onValueChange={(value) => setEmployeeFormData(prev => ({...prev, position: value}))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueEmployeePositions.map((position: string) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddPosition(true)}
                      className="whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-emp-email">Email *</Label>
                  <Input
                    id="new-emp-email"
                    type="email"
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="nama@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-emp-phone">No. Telepon</Label>
                  <Input
                    id="new-emp-phone"
                    value={employeeFormData.phone}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-emp-salary">Gaji Pokok</Label>
                  <Input
                    id="new-emp-salary"
                    type="number"
                    value={employeeFormData.baseSalary}
                    onChange={(e) => setEmployeeFormData(prev => ({...prev, baseSalary: e.target.value}))}
                    placeholder="3500000"
                  />
                </div>
                <div>
                  <Label htmlFor="new-emp-outlet">Outlet</Label>
                  <Select 
                    value={employeeFormData.outletId} 
                    onValueChange={(value) => setEmployeeFormData(prev => ({...prev, outletId: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Outlet</SelectItem>
                      {outlets?.map((outlet: any) => (
                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                          {outlet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddNewEmployee(false);
                    resetNewEmployeeForm();
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#f29716] hover:bg-[#d4820a]"
                  disabled={createEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending ? 'Menyimpan...' : 'Tambah Karyawan'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Position Modal */}
      <Dialog open={showAddPosition} onOpenChange={setShowAddPosition}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Jabatan Baru</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="position-name">Nama Jabatan</Label>
              <Input
                id="position-name"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="Contoh: Manager, Staff, Kasir"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPosition();
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddPosition(false);
                  setNewPositionName('');
                }}
              >
                Batal
              </Button>
              <Button onClick={handleAddPosition} className="bg-[#f29716] hover:bg-[#d4820a]">
                Tambah
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
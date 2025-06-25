import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, DollarSign, Download, Plus, Edit2, AlertCircle, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TaxManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    period: '',
    revenue: '',
    taxAmount: '',
    status: 'draft'
  });
  
  // Mock report states - in real app this would come from backend
  const [reportStates, setReportStates] = useState({
    current: 'real-time', // real-time, draft, submitted, paid
    q1: 'paid',
    draft: 'draft'
  });
  
  const { data: taxSummary = {}, isLoading } = useQuery({
    queryKey: ['/api/tax/summary'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/tax/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tax data');
      return response.json();
    }
  });

  // Function to export tax report as PDF
  const handleExportReport = () => {
    if (!taxSummary.quarter) return;
    
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Pajak PPh Final UMKM</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #f29716;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #f29716;
            margin-bottom: 10px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .period {
            font-size: 16px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #f29716;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .label {
            font-weight: 500;
        }
        .value {
            font-weight: bold;
            color: #333;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .calculation {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">FinanceWhiz.AI - Toko Berkah</div>
        <div class="title">LAPORAN PAJAK PPh FINAL UMKM</div>
        <div class="period">Periode: ${taxSummary.quarter}</div>
    </div>

    <div class="section">
        <div class="section-title">DATA KEUANGAN</div>
        <div class="data-row">
            <span class="label">Omzet ${taxSummary.quarter}:</span>
            <span class="value">${formatCurrency(taxSummary.quarterlyIncome || 0)}</span>
        </div>
        <div class="data-row">
            <span class="label">Omzet Tahun Ini (YTD):</span>
            <span class="value">${formatCurrency(taxSummary.yearlyIncome || 0)}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PERHITUNGAN PAJAK PPh FINAL UMKM</div>
        <div class="calculation">
            <div class="data-row">
                <span class="label">Tarif PPh Final UMKM:</span>
                <span class="value">${((taxSummary.taxRate || 0.005) * 100).toFixed(1)}%</span>
            </div>
            <div class="data-row">
                <span class="label">Rumus:</span>
                <span class="value">Omzet × ${((taxSummary.taxRate || 0.005) * 100).toFixed(1)}%</span>
            </div>
        </div>
        <div class="data-row">
            <span class="label">Pajak ${taxSummary.quarter}:</span>
            <span class="value">${formatCurrency(taxSummary.currentQuarterTax || 0)}</span>
        </div>
        <div class="data-row">
            <span class="label">Total Pajak Tahun Ini:</span>
            <span class="value">${formatCurrency(taxSummary.yearToDateTax || 0)}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">INFORMASI PEMBAYARAN</div>
        <div class="data-row">
            <span class="label">Batas Waktu Pembayaran:</span>
            <span class="value">${taxSummary.upcomingDeadline ? new Date(taxSummary.upcomingDeadline).toLocaleDateString('id-ID') : 'N/A'}</span>
        </div>
        <div class="data-row">
            <span class="label">Status Kepatuhan:</span>
            <span class="value">${taxSummary.complianceStatus === 'compliant' ? 'Patuh' : 'Belum Patuh'}</span>
        </div>
    </div>

    <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem FinanceWhiz.AI</p>
        <p>Tanggal Generate: ${new Date().toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p><strong>Catatan:</strong> Harap verifikasi data dengan dokumen pendukung sebelum melakukan pembayaran pajak</p>
    </div>
</body>
</html>`;

    // Create and download PDF using print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog for PDF save
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
    
    toast({
      title: "Laporan PDF Siap",
      description: "Dialog print telah dibuka - pilih 'Save as PDF' untuk menyimpan"
    });
  };

  // Function to handle status change
  const handleStatusChange = (reportType: string, newStatus: string) => {
    setReportStates(prev => ({
      ...prev,
      [reportType]: newStatus
    }));
    
    const statusLabels = {
      'real-time': 'Real-time',
      'draft': 'Draft',
      'submitted': 'Disetor',
      'paid': 'Lunas'
    };
    
    toast({
      title: "Status Berhasil Diubah",
      description: `Status laporan diubah menjadi ${statusLabels[newStatus as keyof typeof statusLabels]}`
    });
  };

  // Function to handle edit modal
  const handleEditReport = (reportType: string) => {
    setEditData({
      period: reportType === 'current' ? taxSummary.quarter || 'Q2 2025' : 'Q1 2025',
      revenue: reportType === 'current' ? (taxSummary.quarterlyIncome || 0).toString() : '150000000',
      taxAmount: reportType === 'current' ? (taxSummary.currentQuarterTax || 0).toString() : '750000',
      status: reportStates[reportType as keyof typeof reportStates] || 'draft'
    });
    setShowEditModal(true);
  };

  // Function to save edited report
  const handleSaveEdit = () => {
    // In real app, this would save to backend
    toast({
      title: "Laporan Berhasil Diedit",
      description: "Perubahan data laporan pajak telah disimpan"
    });
    setShowEditModal(false);
  };

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      'real-time': 'bg-blue-100 text-blue-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'submitted': 'bg-green-100 text-green-800',
      'paid': 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      'real-time': 'Real-time',
      'draft': 'Draft',
      'submitted': 'Disetor',
      'paid': 'Lunas'
    };
    
    return {
      className: styles[status as keyof typeof styles] || 'bg-muted text-gray-800',
      label: labels[status as keyof typeof labels] || status
    };
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-league">Manajemen Pajak</h1>
          <p className="text-muted-foreground mt-1 font-league">Kelola kewajiban pajak dan laporan UMKM</p>
        </div>
        <Button 
          onClick={handleExportReport}
          className="bg-[#f29716] hover:bg-[#d4820a] font-league"
          disabled={!taxSummary.quarter}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      {/* Information Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 font-league">Cara Kerja Perhitungan Pajak UMKM</h3>
              <p className="text-blue-800 mt-1 font-league">
                Sistem menghitung pajak PPh Final 0.5% secara otomatis berdasarkan <strong>data omzet dari menu Laporan</strong>. 
                Omzet kotor dikali 0.5% = Pajak yang harus dibayar. Contoh: Omzet Rp 100 juta × 0.5% = Rp 500.000 pajak per bulan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-league">
                  Pajak {taxSummary.quarter || 'Kuartal Ini'}
                </p>
                <p className="text-2xl font-bold text-foreground font-league">
                  {formatCurrency(taxSummary.currentQuarterTax || 0)}
                </p>
                <p className="text-xs text-muted-foreground font-league">
                  Dari omzet: {formatCurrency(taxSummary.quarterlyIncome || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-league">Total Pajak Tahun Ini</p>
                <p className="text-2xl font-bold text-foreground font-league">
                  {formatCurrency(taxSummary.yearToDateTax || 0)}
                </p>
                <p className="text-xs text-muted-foreground font-league">
                  Dari omzet: {formatCurrency(taxSummary.yearlyIncome || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-league">Tarif PPh Final UMKM</p>
                <p className="text-2xl font-bold text-foreground font-league">
                  {((taxSummary.taxRate || 0.005) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground font-league">
                  Jatuh tempo: {taxSummary.upcomingDeadline ? new Date(taxSummary.upcomingDeadline).toLocaleDateString('id-ID') : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-league">Riwayat Laporan Pajak</CardTitle>
          <CardDescription className="font-league">Daftar laporan pajak yang telah dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Quarter Report */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex-1">
                <h3 className="font-medium font-league">Laporan PPh Final {taxSummary.quarter || 'Q2 2025'}</h3>
                <p className="text-sm text-muted-foreground font-league">
                  Omzet: {formatCurrency(taxSummary.quarterlyIncome || 0)} | 
                  Pajak: {formatCurrency(taxSummary.currentQuarterTax || 0)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div onClick={() => handleStatusChange('current', reportStates.current === 'real-time' ? 'submitted' : 'real-time')} className="cursor-pointer">
                  <Badge className={`${getStatusBadge(reportStates.current).className} font-league`}>
                    {getStatusBadge(reportStates.current).label}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-league"
                  onClick={handleExportReport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Previous Quarter Example */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium font-league">Laporan PPh Final Q1 2025</h3>
                <p className="text-sm text-muted-foreground font-league">Periode: Januari - Maret 2025</p>
              </div>
              <div className="flex items-center space-x-3">
                <div onClick={() => handleStatusChange('q1', reportStates.q1 === 'paid' ? 'submitted' : 'paid')} className="cursor-pointer">
                  <Badge className={`${getStatusBadge(reportStates.q1).className} font-league`}>
                    {getStatusBadge(reportStates.q1).label}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-league"
                  onClick={handleExportReport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Draft Example - untuk koreksi/revisi */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium font-league">Draft Koreksi PPh Final</h3>
                <p className="text-sm text-muted-foreground font-league">Untuk revisi perhitungan pajak manual</p>
              </div>
              <div className="flex items-center space-x-3">
                <div onClick={() => handleStatusChange('draft', reportStates.draft === 'draft' ? 'submitted' : 'draft')} className="cursor-pointer">
                  <Badge className={`${getStatusBadge(reportStates.draft).className} font-league`}>
                    {getStatusBadge(reportStates.draft).label}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-league"
                  onClick={() => handleEditReport('draft')}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-league">Edit Laporan Pajak</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="period" className="font-league">Periode</Label>
              <Input
                id="period"
                value={editData.period}
                onChange={(e) => setEditData({...editData, period: e.target.value})}
                placeholder="Q2 2025"
                className="font-league"
              />
            </div>
            <div>
              <Label htmlFor="revenue" className="font-league">Omzet (Rp)</Label>
              <Input
                id="revenue"
                type="number"
                value={editData.revenue}
                onChange={(e) => setEditData({...editData, revenue: e.target.value})}
                placeholder="387900000"
                className="font-league"
              />
            </div>
            <div>
              <Label htmlFor="taxAmount" className="font-league">Pajak PPh Final (Rp)</Label>
              <Input
                id="taxAmount"
                type="number"
                value={editData.taxAmount}
                onChange={(e) => setEditData({...editData, taxAmount: e.target.value})}
                placeholder="1939500"
                className="font-league"
              />
            </div>
            <div>
              <Label htmlFor="status" className="font-league">Status</Label>
              <Select
                value={editData.status}
                onValueChange={(value) => setEditData({...editData, status: value})}
              >
                <SelectTrigger className="font-league">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="font-league">Draft</SelectItem>
                  <SelectItem value="submitted" className="font-league">Disetor</SelectItem>
                  <SelectItem value="paid" className="font-league">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1 font-league"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-[#f29716] hover:bg-[#d4820a] font-league"
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
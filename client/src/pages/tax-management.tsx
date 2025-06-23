import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, DollarSign, Download, Plus, Edit2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TaxManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Function to export tax report
  const handleExportReport = () => {
    if (!taxSummary.quarter) return;
    
    const reportData = `
LAPORAN PAJAK PPh FINAL UMKM
Periode: ${taxSummary.quarter}
========================================

DATA KEUANGAN:
- Omzet ${taxSummary.quarter}: ${formatCurrency(taxSummary.quarterlyIncome || 0)}
- Omzet Tahun Ini: ${formatCurrency(taxSummary.yearlyIncome || 0)}

PERHITUNGAN PAJAK:
- Tarif PPh Final UMKM: ${((taxSummary.taxRate || 0.005) * 100).toFixed(1)}%
- Pajak ${taxSummary.quarter}: ${formatCurrency(taxSummary.currentQuarterTax || 0)}
- Total Pajak Tahun Ini: ${formatCurrency(taxSummary.yearToDateTax || 0)}

JADWAL PEMBAYARAN:
- Batas Waktu Pembayaran: ${taxSummary.upcomingDeadline || 'N/A'}
- Status Kepatuhan: ${taxSummary.complianceStatus === 'compliant' ? 'Patuh' : 'Belum Patuh'}

Digenerate oleh: FinanceWhiz.AI - Toko Berkah
Tanggal: ${new Date().toLocaleDateString('id-ID')}
========================================
`;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Pajak_${taxSummary.quarter?.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Laporan Berhasil Diexport",
      description: "File laporan pajak telah didownload"
    });
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
          <h1 className="text-3xl font-bold text-gray-900 font-league">Manajemen Pajak</h1>
          <p className="text-gray-600 mt-1 font-league">Kelola kewajiban pajak dan laporan UMKM</p>
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
                <p className="text-sm font-medium text-gray-600 font-league">
                  Pajak {taxSummary.quarter || 'Kuartal Ini'}
                </p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {formatCurrency(taxSummary.currentQuarterTax || 0)}
                </p>
                <p className="text-xs text-gray-500 font-league">
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
                <p className="text-sm font-medium text-gray-600 font-league">Total Pajak Tahun Ini</p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {formatCurrency(taxSummary.yearToDateTax || 0)}
                </p>
                <p className="text-xs text-gray-500 font-league">
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
                <p className="text-sm font-medium text-gray-600 font-league">Tarif PPh Final UMKM</p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {((taxSummary.taxRate || 0.005) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 font-league">
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium font-league">Laporan PPh Final Q1 2024</h3>
                <p className="text-sm text-gray-600 font-league">Periode: Januari - Maret 2024</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 font-league">Selesai</Badge>
                <Button variant="outline" size="sm" className="font-league">Download</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium font-league">Laporan PPh Final Q2 2024</h3>
                <p className="text-sm text-gray-600 font-league">Periode: April - Juni 2024</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-yellow-100 text-yellow-800 font-league">Draft</Badge>
                <Button variant="outline" size="sm" className="font-league">Edit</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, DollarSign, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TaxManagement() {
  const { data: taxSummary = {}, isLoading } = useQuery({
    queryKey: ['/api/tax/summary'],
    queryFn: () => fetch('/api/tax/summary').then(res => res.json())
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-league">Manajemen Pajak</h1>
          <p className="text-gray-600 mt-1 font-league">Kelola kewajiban pajak dan laporan UMKM</p>
        </div>
        <Button className="bg-[#f29716] hover:bg-[#d4820a] font-league">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Pajak Kuartal Ini</p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {formatCurrency(taxSummary.currentQuarterTax || 0)}
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
                <p className="text-sm font-medium text-gray-600 font-league">Total Tahun Ini</p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {formatCurrency(taxSummary.yearToDateTax || 0)}
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
                <p className="text-sm font-medium text-gray-600 font-league">Tarif PPh Final</p>
                <p className="text-2xl font-bold text-gray-900 font-league">0.5%</p>
                <p className="text-sm text-gray-500 font-league">UMKM Rate</p>
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
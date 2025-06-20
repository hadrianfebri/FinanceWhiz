import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Phone, Mail, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Mock data for vendors
  const vendorData = [
    {
      id: 1,
      name: 'PT Sumber Rejeki',
      contactPerson: 'Agus Setiawan',
      phone: '081234567890',
      email: 'agus@sumberrejeki.com',
      address: 'Jl. Industri No. 45, Jakarta',
      paymentTerms: 30,
      totalTransactions: 15650000,
      lastTransaction: '2024-06-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'CV Maju Bersama',
      contactPerson: 'Sri Wahyuni',
      phone: '087654321098',
      email: 'sri@majubersama.co.id',
      address: 'Jl. Perdagangan No. 12, Surabaya',
      paymentTerms: 14,
      totalTransactions: 8750000,
      lastTransaction: '2024-06-10',
      status: 'active'
    },
    {
      id: 3,
      name: 'Toko Serba Ada',
      contactPerson: 'Muhammad Fadli',
      phone: '085123456789',
      email: 'fadli@tokoserbaada.com',
      address: 'Jl. Raya Bogor No. 88, Depok',
      paymentTerms: 7,
      totalTransactions: 3200000,
      lastTransaction: '2024-05-28',
      status: 'inactive'
    }
  ];

  const vendorSummary = {
    totalVendors: 12,
    activeVendors: 9,
    totalSpending: 28600000,
    pendingInvoices: 5
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVendors = vendorData.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Vendor</h1>
          <p className="text-gray-600 mt-1">Kelola vendor dan supplier bisnis Anda</p>
        </div>
        <Button className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendor</p>
                <p className="text-2xl font-bold text-gray-900">{vendorSummary.totalVendors}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendor Aktif</p>
                <p className="text-2xl font-bold text-green-600">{vendorSummary.activeVendors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(vendorSummary.totalSpending)}</p>
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
                <p className="text-sm font-medium text-gray-600">Invoice Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{vendorSummary.pendingInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari vendor berdasarkan nama atau kontak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription className="mt-1">{vendor.contactPerson}</CardDescription>
                </div>
                {getStatusBadge(vendor.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {vendor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  {vendor.address}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Transaksi</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(vendor.totalTransactions)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Termin Bayar</p>
                    <p className="font-semibold text-gray-900">{vendor.paymentTerms} hari</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-600 text-sm">Transaksi Terakhir</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(vendor.lastTransaction)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Riwayat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Terbaru</CardTitle>
          <CardDescription>Daftar invoice dari vendor yang perlu diproses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">PT Sumber Rejeki - INV-2024-001</p>
                <p className="text-sm text-gray-600">Jatuh tempo: 30 Juni 2024 • {formatCurrency(2500000)}</p>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">CV Maju Bersama - INV-2024-002</p>
                <p className="text-sm text-gray-600">Jatuh tempo: 5 Juli 2024 • {formatCurrency(1800000)}</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">Approved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
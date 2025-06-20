import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, Upload, Download, Store, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { api } from '@/lib/api';

export default function PosSync() {
  const [isSync, setIsSync] = useState(false);
  const queryClient = useQueryClient();

  // Mock data for POS transactions
  const posTransactions = [
    {
      id: 1,
      outletName: 'Cabang Utama',
      posTransactionId: 'POS-2024-001',
      totalAmount: 125000,
      paymentMethod: 'Cash',
      customerCount: 1,
      transactionTime: '2024-06-20T14:30:00',
      cashierName: 'Ahmad Rizki',
      items: 'Nasi Gudeg x2, Es Teh x2',
      syncedToAccounting: true,
      createdAt: '2024-06-20T14:30:00'
    },
    {
      id: 2,
      outletName: 'Cabang Mall',
      posTransactionId: 'POS-2024-002',
      totalAmount: 85000,
      paymentMethod: 'QRIS',
      customerCount: 1,
      transactionTime: '2024-06-20T15:15:00',
      cashierName: 'Siti Nurhaliza',
      items: 'Ayam Bakar x1, Nasi Putih x1, Air Mineral x1',
      syncedToAccounting: false,
      createdAt: '2024-06-20T15:15:00'
    },
    {
      id: 3,
      outletName: 'Cabang Utama',
      posTransactionId: 'POS-2024-003',
      totalAmount: 250000,
      paymentMethod: 'Debit Card',
      customerCount: 3,
      transactionTime: '2024-06-20T16:00:00',
      cashierName: 'Ahmad Rizki',
      items: 'Paket Keluarga x1, Es Jeruk x3',
      syncedToAccounting: false,
      createdAt: '2024-06-20T16:00:00'
    }
  ];

  const syncSummary = {
    totalPosTransactions: 45,
    syncedTransactions: 38,
    pendingSync: 7,
    lastSyncTime: '2024-06-20T13:00:00',
    totalRevenue: 15750000
  };

  const getSyncBadge = (synced: boolean) => {
    return synced 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Tersinkron</Badge>
      : <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const handleSyncAll = async () => {
    setIsSync(true);
    // Simulate sync process
    setTimeout(() => {
      setIsSync(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sinkronisasi POS</h1>
          <p className="text-gray-600 mt-1">Integrasikan data penjualan POS dengan sistem akuntansi</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            className="bg-[#f29716] hover:bg-[#d4820a] flex items-center gap-2"
            onClick={handleSyncAll}
            disabled={isSync}
          >
            {isSync ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {isSync ? 'Sinkronisasi...' : 'Sinkronisasi Semua'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi POS</p>
                <p className="text-2xl font-bold text-gray-900">{syncSummary.totalPosTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tersinkron</p>
                <p className="text-2xl font-bold text-green-600">{syncSummary.syncedTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Sinkron</p>
                <p className="text-2xl font-bold text-yellow-600">{syncSummary.pendingSync}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(syncSummary.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-[#f29716]" />
            Status Sinkronisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Cabang Utama</p>
              <p className="text-sm text-gray-600">Tersinkron</p>
              <p className="text-xs text-gray-500 mt-1">Last sync: {formatDateTime(syncSummary.lastSyncTime)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Cabang Mall</p>
              <p className="text-sm text-gray-600">Pending (3 transaksi)</p>
              <p className="text-xs text-gray-500 mt-1">Last sync: 2 jam lalu</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Store className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Cabang Baru</p>
              <p className="text-sm text-gray-600">Siap untuk setup</p>
              <p className="text-xs text-gray-500 mt-1">Belum dikonfigurasi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent POS Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaksi POS Terbaru</CardTitle>
              <CardDescription>Data penjualan dari sistem POS yang perlu disinkronkan</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">ID Transaksi</th>
                  <th className="text-left p-3 font-medium text-gray-900">Outlet</th>
                  <th className="text-left p-3 font-medium text-gray-900">Kasir</th>
                  <th className="text-right p-3 font-medium text-gray-900">Total</th>
                  <th className="text-left p-3 font-medium text-gray-900">Pembayaran</th>
                  <th className="text-left p-3 font-medium text-gray-900">Waktu</th>
                  <th className="text-center p-3 font-medium text-gray-900">Status Sync</th>
                  <th className="text-center p-3 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{transaction.posTransactionId}</td>
                    <td className="p-3 text-gray-600">{transaction.outletName}</td>
                    <td className="p-3 text-gray-600">{transaction.cashierName}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(transaction.totalAmount)}</td>
                    <td className="p-3 text-gray-600">{transaction.paymentMethod}</td>
                    <td className="p-3 text-gray-600">{formatDateTime(transaction.transactionTime)}</td>
                    <td className="p-3 text-center">{getSyncBadge(transaction.syncedToAccounting)}</td>
                    <td className="p-3 text-center">
                      {!transaction.syncedToAccounting && (
                        <Button variant="outline" size="sm">
                          Sync
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* POS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi POS</CardTitle>
          <CardDescription>Pengaturan integrasi dengan sistem POS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint POS</label>
                <Input placeholder="https://pos.example.com/api" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <Input type="password" placeholder="••••••••••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interval Sinkronisasi</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="5">Setiap 5 menit</option>
                  <option value="15">Setiap 15 menit</option>
                  <option value="30">Setiap 30 menit</option>
                  <option value="60">Setiap 1 jam</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format Data</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  Test Koneksi
                </Button>
                <Button className="flex-1 bg-[#f29716] hover:bg-[#d4820a]">
                  Simpan Konfigurasi
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Log */}
      <Card>
        <CardHeader>
          <CardTitle>Log Sinkronisasi</CardTitle>
          <CardDescription>Riwayat sinkronisasi data POS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Sinkronisasi berhasil</p>
                  <p className="text-sm text-gray-600">12 transaksi dari Cabang Utama</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{formatDateTime('2024-06-20T13:00:00')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Sinkronisasi tertunda</p>
                  <p className="text-sm text-gray-600">3 transaksi dari Cabang Mall - Koneksi timeout</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{formatDateTime('2024-06-20T12:30:00')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
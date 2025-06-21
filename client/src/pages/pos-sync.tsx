import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function POSSync() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setSyncing(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-league">Sinkronisasi POS</h1>
          <p className="text-gray-600 mt-1 font-league">Sinkronkan data penjualan dari sistem POS</p>
        </div>
        <Button 
          className="bg-[#f29716] hover:bg-[#d4820a] font-league"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Status Koneksi</p>
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 font-league">Terhubung</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Monitor className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Sinkronisasi Terakhir</p>
                <p className="text-sm font-medium text-gray-900 font-league">
                  {formatDate(new Date())}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Transaksi Hari Ini</p>
                <p className="text-xl font-bold text-gray-900 font-league">156</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-league">Log Sinkronisasi</CardTitle>
          <CardDescription className="font-league">Riwayat sinkronisasi data POS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium font-league">Sinkronisasi Otomatis</h3>
                <p className="text-sm text-gray-600 font-league">156 transaksi berhasil disinkronkan</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 font-league">Berhasil</Badge>
                <span className="text-sm text-gray-500 font-league">2 menit lalu</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium font-league">Sinkronisasi Manual</h3>
                <p className="text-sm text-gray-600 font-league">89 transaksi berhasil disinkronkan</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 font-league">Berhasil</Badge>
                <span className="text-sm text-gray-500 font-league">1 jam lalu</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
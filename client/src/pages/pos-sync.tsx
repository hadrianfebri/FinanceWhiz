import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Monitor, AlertCircle, CheckCircle, Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function POSSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [showAddPOSModal, setShowAddPOSModal] = useState(false);
  const [showEditPOSModal, setShowEditPOSModal] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState<any>(null);
  const [posFormData, setPosFormData] = useState({
    name: '',
    type: 'cashier', // cashier, self-service, mobile
    location: '',
    outletId: '',
    apiKey: '',
    apiUrl: ''
  });

  // Mock POS devices data - in real app this would come from backend
  const [posDevices] = useState([
    {
      id: 1,
      name: 'Kasir Utama',
      type: 'cashier',
      location: 'Cabang Utama - Counter 1',
      outletId: 1,
      status: 'connected',
      lastSync: new Date(),
      todayTransactions: 156,
      apiUrl: 'https://pos1.tokoberkah.com/api'
    },
    {
      id: 2,
      name: 'Self-Service Kiosk',
      type: 'self-service',
      location: 'Cabang Utama - Area Depan',
      outletId: 1,
      status: 'connected',
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      todayTransactions: 42,
      apiUrl: 'https://kiosk1.tokoberkah.com/api'
    },
    {
      id: 3,
      name: 'Mobile POS',
      type: 'mobile',
      location: 'Cabang Bandung - Staff',
      outletId: 2,
      status: 'disconnected',
      lastSync: new Date(Date.now() - 3600000), // 1 hour ago
      todayTransactions: 0,
      apiUrl: 'https://mobile1.tokoberkah.com/api'
    }
  ]);

  const handleSync = async () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast({
        title: "Sinkronisasi Berhasil",
        description: "Data POS telah berhasil disinkronkan"
      });
    }, 3000);
  };

  const handleAddPOS = () => {
    setPosFormData({
      name: '',
      type: 'cashier',
      location: '',
      outletId: '',
      apiKey: '',
      apiUrl: ''
    });
    setShowAddPOSModal(true);
  };

  const handleEditPOS = (pos: any) => {
    setSelectedPOS(pos);
    setPosFormData({
      name: pos.name,
      type: pos.type,
      location: pos.location,
      outletId: pos.outletId.toString(),
      apiKey: '••••••••••••••••', // Hidden for security
      apiUrl: pos.apiUrl
    });
    setShowEditPOSModal(true);
  };

  const handleSavePOS = () => {
    // In real app, this would save to backend
    toast({
      title: "POS Berhasil Disimpan",
      description: "Konfigurasi POS telah berhasil disimpan"
    });
    setShowAddPOSModal(false);
    setShowEditPOSModal(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-red-100 text-red-800',
      syncing: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      connected: 'Terhubung',
      disconnected: 'Terputus',
      syncing: 'Sinkronisasi'
    };
    
    return {
      className: styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800',
      label: labels[status as keyof typeof labels] || status
    };
  };

  const getPOSTypeLabel = (type: string) => {
    const labels = {
      cashier: 'Kasir',
      'self-service': 'Self-Service',
      mobile: 'Mobile POS'
    };
    return labels[type as keyof typeof labels] || type;
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
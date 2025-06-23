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
          <p className="text-gray-600 mt-1 font-league">Kelola dan sinkronkan data penjualan dari sistem POS</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={handleAddPOS}
            className="font-league"
          >
            <Plus className="h-4 w-4 mr-2" />
            Daftarkan POS
          </Button>
          <Button 
            className="bg-[#f29716] hover:bg-[#d4820a] font-league"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}
          </Button>
        </div>
      </div>

      {/* POS Devices Management */}
      <Card>
        <CardHeader>
          <CardTitle className="font-league">Perangkat POS Terdaftar</CardTitle>
          <CardDescription className="font-league">Kelola semua sistem POS yang terhubung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posDevices.map((pos) => (
              <div key={pos.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium font-league">{pos.name}</h3>
                  <Badge className={`${getStatusBadge(pos.status).className} font-league`}>
                    {getStatusBadge(pos.status).label}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 font-league">{getPOSTypeLabel(pos.type)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 font-league">{pos.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 font-league">
                      Sync: {formatDate(pos.lastSync)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 font-league">
                      {pos.todayTransactions} transaksi hari ini
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPOS(pos)}
                    className="flex-1 font-league"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-league"
                    onClick={() => handleSync()}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Total POS</p>
                <p className="text-2xl font-bold text-gray-900 font-league">{posDevices.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Terhubung</p>
                <p className="text-2xl font-bold text-green-600 font-league">
                  {posDevices.filter(p => p.status === 'connected').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600 font-league">Terputus</p>
                <p className="text-2xl font-bold text-red-600 font-league">
                  {posDevices.filter(p => p.status === 'disconnected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-league">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900 font-league">
                  {posDevices.reduce((sum, pos) => sum + pos.todayTransactions, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-purple-600" />
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

      {/* Add POS Modal */}
      <Dialog open={showAddPOSModal} onOpenChange={setShowAddPOSModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-league">Daftarkan POS Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="posName" className="font-league">Nama POS *</Label>
              <Input
                id="posName"
                value={posFormData.name}
                onChange={(e) => setPosFormData({...posFormData, name: e.target.value})}
                placeholder="Kasir Utama"
                className="font-league"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="posType" className="font-league">Jenis POS *</Label>
              <Select
                value={posFormData.type}
                onValueChange={(value) => setPosFormData({...posFormData, type: value})}
              >
                <SelectTrigger className="font-league">
                  <SelectValue placeholder="Pilih jenis POS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier" className="font-league">Kasir</SelectItem>
                  <SelectItem value="self-service" className="font-league">Self-Service</SelectItem>
                  <SelectItem value="mobile" className="font-league">Mobile POS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="posLocation" className="font-league">Lokasi *</Label>
              <Input
                id="posLocation"
                value={posFormData.location}
                onChange={(e) => setPosFormData({...posFormData, location: e.target.value})}
                placeholder="Cabang Utama - Counter 1"
                className="font-league"
                required
              />
            </div>

            <div>
              <Label htmlFor="outletId" className="font-league">Outlet *</Label>
              <Select
                value={posFormData.outletId}
                onValueChange={(value) => setPosFormData({...posFormData, outletId: value})}
              >
                <SelectTrigger className="font-league">
                  <SelectValue placeholder="Pilih outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="font-league">Cabang Utama</SelectItem>
                  <SelectItem value="2" className="font-league">Cabang Bandung</SelectItem>
                  <SelectItem value="3" className="font-league">Cabang Surabaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="apiUrl" className="font-league">API URL *</Label>
              <Input
                id="apiUrl"
                value={posFormData.apiUrl}
                onChange={(e) => setPosFormData({...posFormData, apiUrl: e.target.value})}
                placeholder="https://pos.tokoberkah.com/api"
                className="font-league"
                required
              />
            </div>

            <div>
              <Label htmlFor="apiKey" className="font-league">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={posFormData.apiKey}
                onChange={(e) => setPosFormData({...posFormData, apiKey: e.target.value})}
                placeholder="Masukkan API key POS"
                className="font-league"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-league">
                <strong>Cara mendapatkan API Key:</strong><br/>
                1. Login ke sistem POS Anda<br/>
                2. Masuk ke menu Settings - API Integration<br/>
                3. Generate API Key baru<br/>
                4. Copy dan paste ke field di atas
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddPOSModal(false)}
                className="flex-1 font-league"
              >
                Batal
              </Button>
              <Button
                onClick={handleSavePOS}
                className="flex-1 bg-[#f29716] hover:bg-[#d4820a] font-league"
              >
                Daftarkan POS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit POS Modal */}
      <Dialog open={showEditPOSModal} onOpenChange={setShowEditPOSModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-league">Edit Konfigurasi POS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editPosName" className="font-league">Nama POS *</Label>
              <Input
                id="editPosName"
                value={posFormData.name}
                onChange={(e) => setPosFormData({...posFormData, name: e.target.value})}
                placeholder="Kasir Utama"
                className="font-league"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editPosType" className="font-league">Jenis POS *</Label>
              <Select
                value={posFormData.type}
                onValueChange={(value) => setPosFormData({...posFormData, type: value})}
              >
                <SelectTrigger className="font-league">
                  <SelectValue placeholder="Pilih jenis POS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier" className="font-league">Kasir</SelectItem>
                  <SelectItem value="self-service" className="font-league">Self-Service</SelectItem>
                  <SelectItem value="mobile" className="font-league">Mobile POS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editPosLocation" className="font-league">Lokasi *</Label>
              <Input
                id="editPosLocation"
                value={posFormData.location}
                onChange={(e) => setPosFormData({...posFormData, location: e.target.value})}
                placeholder="Cabang Utama - Counter 1"
                className="font-league"
                required
              />
            </div>

            <div>
              <Label htmlFor="editOutletId" className="font-league">Outlet *</Label>
              <Select
                value={posFormData.outletId}
                onValueChange={(value) => setPosFormData({...posFormData, outletId: value})}
              >
                <SelectTrigger className="font-league">
                  <SelectValue placeholder="Pilih outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="font-league">Cabang Utama</SelectItem>
                  <SelectItem value="2" className="font-league">Cabang Bandung</SelectItem>
                  <SelectItem value="3" className="font-league">Cabang Surabaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editApiUrl" className="font-league">API URL *</Label>
              <Input
                id="editApiUrl"
                value={posFormData.apiUrl}
                onChange={(e) => setPosFormData({...posFormData, apiUrl: e.target.value})}
                placeholder="https://pos.tokoberkah.com/api"
                className="font-league"
                required
              />
            </div>

            <div>
              <Label htmlFor="editApiKey" className="font-league">API Key *</Label>
              <Input
                id="editApiKey"
                type="password"
                value={posFormData.apiKey}
                onChange={(e) => setPosFormData({...posFormData, apiKey: e.target.value})}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="font-league"
              />
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-800 font-league">
                <strong>Status Koneksi:</strong> {selectedPOS?.status === 'connected' ? 'Terhubung' : 'Terputus'}<br/>
                <strong>Sync Terakhir:</strong> {selectedPOS ? formatDate(selectedPOS.lastSync) : '-'}
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditPOSModal(false)}
                className="flex-1 font-league"
              >
                Batal
              </Button>
              <Button
                onClick={handleSavePOS}
                className="flex-1 bg-[#f29716] hover:bg-[#d4820a] font-league"
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
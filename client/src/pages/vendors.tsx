import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Phone, Mail, Calendar, Edit, Trash2, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Vendors() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: '30',
    contractAmount: '',
    documentFile: null as File | null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      return response.json();
    }
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: any) => {
      const token = localStorage.getItem('auth_token');
      
      const formDataToSend = new FormData();
      Object.keys(vendorData).forEach(key => {
        if (key === 'documentFile' && vendorData[key]) {
          formDataToSend.append('document', vendorData[key]);
        } else if (vendorData[key] !== null && vendorData[key] !== '') {
          formDataToSend.append(key, vendorData[key]);
        }
      });

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setShowAddModal(false);
      resetForm();
      toast({
        title: "Berhasil",
        description: "Vendor berhasil ditambahkan"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan vendor",
        variant: "destructive"
      });
    }
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, vendorData }: { id: number; vendorData: any }) => {
      const token = localStorage.getItem('auth_token');
      
      const formDataToSend = new FormData();
      Object.keys(vendorData).forEach(key => {
        if (key === 'documentFile' && vendorData[key]) {
          formDataToSend.append('document', vendorData[key]);
        } else if (vendorData[key] !== null && vendorData[key] !== '') {
          formDataToSend.append(key, vendorData[key]);
        }
      });

      const response = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setShowEditModal(false);
      resetForm();
      toast({
        title: "Berhasil",
        description: "Vendor berhasil diperbarui"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui vendor",
        variant: "destructive"
      });
    }
  });

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete vendor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Berhasil",
        description: "Vendor berhasil dihapus"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus vendor",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: '30',
      contractAmount: '',
      documentFile: null
    });
    setSelectedVendor(null);
  };

  const handleAddVendor = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      paymentTerms: vendor.paymentTerms?.toString() || '30',
      contractAmount: vendor.contractAmount?.toString() || '',
      documentFile: null
    });
    setShowEditModal(true);
  };

  const handleDeleteVendor = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus vendor ini?')) {
      deleteVendorMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendorData = {
      ...formData,
      paymentTerms: parseInt(formData.paymentTerms) || 30
    };

    if (showEditModal && selectedVendor) {
      updateVendorMutation.mutate({ id: selectedVendor.id, vendorData });
    } else {
      createVendorMutation.mutate(vendorData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-foreground font-league">Manajemen Vendor</h1>
          <p className="text-muted-foreground mt-1 font-league">Kelola supplier dan vendor bisnis Anda</p>
        </div>
        <Button 
          onClick={handleAddVendor}
          className="bg-[#f29716] hover:bg-[#d4820a] font-league"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(vendors) && vendors.length > 0 ? vendors.map((vendor: any) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="font-league">{vendor.name}</CardTitle>
                    <CardDescription className="font-league">{vendor.contactPerson}</CardDescription>
                  </div>
                </div>
                <Badge variant={vendor.isActive ? "default" : "secondary"} className="font-league">
                  {vendor.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="font-league">{vendor.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="font-league">{vendor.email || '-'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-league">{vendor.address || '-'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-league">Payment Terms: {vendor.paymentTerms} hari</span>
              </div>
              {vendor.contractAmount && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-green-600">Kontrak: {formatCurrency(Number(vendor.contractAmount))}</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditVendor(vendor)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground font-league">Belum ada vendor yang terdaftar</p>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Vendor Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Vendor *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Masukkan nama vendor"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Nama Kontak</Label>
              <Input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Nama person in charge"
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nomor telepon vendor"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email vendor"
              />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap vendor"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Termin Pembayaran (hari)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="30"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="contractAmount">Nominal Kontrak</Label>
              <Input
                id="contractAmount"
                type="number"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                placeholder="Masukkan nilai kontrak"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="document">Upload Dokumen (Opsional)</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, documentFile: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground mt-1">Format: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-[#f29716] hover:bg-[#d4820a]"
                disabled={createVendorMutation.isPending}
              >
                {createVendorMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Vendor *</Label>
              <Input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Masukkan nama vendor"
              />
            </div>
            <div>
              <Label htmlFor="edit-contactPerson">Nama Kontak</Label>
              <Input
                id="edit-contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Nama person in charge"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Nomor Telepon</Label>
              <Input
                id="edit-phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nomor telepon vendor"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email vendor"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Alamat</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap vendor"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-paymentTerms">Termin Pembayaran (hari)</Label>
              <Input
                id="edit-paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="30"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="edit-contractAmount">Nominal Kontrak</Label>
              <Input
                id="edit-contractAmount"
                type="number"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                placeholder="Masukkan nilai kontrak"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-document">Upload Dokumen Baru (Opsional)</Label>
              <Input
                id="edit-document"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, documentFile: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground mt-1">Format: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
              {selectedVendor?.documentUrl && (
                <p className="text-xs text-blue-600 mt-1">Dokumen saat ini: ada</p>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-[#f29716] hover:bg-[#d4820a]"
                disabled={updateVendorMutation.isPending}
              >
                {updateVendorMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Building2, Edit, Trash2, MapPin, Phone, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Outlets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddManager, setShowAddManager] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
  const [editingOutlet, setEditingOutlet] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    managerId: "0",
  });
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data: outlets, isLoading } = useQuery({
    queryKey: ["/api/outlets"],
    queryFn: () => api.getOutlets(),
  });

  const { data: managers } = useQuery({
    queryKey: ["/api/users/managers"],
    queryFn: () => api.getManagers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createOutlet(data),
    onSuccess: () => {
      toast({
        title: "Outlet Berhasil Ditambahkan",
        description: "Outlet baru telah berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
      setShowAddOutlet(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menambahkan Outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateOutlet(id, data),
    onSuccess: () => {
      toast({
        title: "Outlet Berhasil Diperbarui",
        description: "Data outlet telah berhasil diupdate",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
      setEditingOutlet(null);
      setShowAddOutlet(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Memperbarui Outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteOutlet(id),
    onSuccess: () => {
      toast({
        title: "Outlet Berhasil Dihapus",
        description: "Outlet telah berhasil dihapus dari sistem",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menghapus Outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createManagerMutation = useMutation({
    mutationFn: (data: any) => api.createEmployee({
      ...data,
      position: 'Manager',
      role: 'manager',
      isActive: true,
      baseSalary: 5000000 // Default manager salary
    }),
    onSuccess: () => {
      toast({
        title: "Manager Berhasil Ditambahkan",
        description: "Manager baru telah berhasil didaftarkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/managers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowAddManager(false);
      resetManagerForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menambahkan Manager",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      managerId: "0",
    });
  };

  const resetManagerForm = () => {
    setManagerData({
      name: "",
      email: "",
      phone: "",
    });
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerData.name.trim() || !managerData.email.trim()) {
      toast({
        title: "Error",
        description: "Nama dan email manager wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createManagerMutation.mutate(managerData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama outlet wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      managerId: formData.managerId && formData.managerId !== "0" ? parseInt(formData.managerId) : null,
    };

    if (editingOutlet) {
      updateMutation.mutate({ id: editingOutlet.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (outlet: any) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address || "",
      phone: outlet.phone || "",
      managerId: outlet.managerId ? outlet.managerId.toString() : "0",
    });
    setShowAddOutlet(true);
  };

  const handleDelete = (outlet: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus outlet "${outlet.name}"?`)) {
      deleteMutation.mutate(outlet.id);
    }
  };

  const handleViewDetail = (outlet: any) => {
    setSelectedOutlet(outlet);
    setShowDetailModal(true);
  };

  const handleViewTransactions = (outlet: any) => {
    toast({
      title: "Transaksi Outlet",
      description: `Membuka transaksi untuk ${outlet.name}`,
    });
    
    // Navigate to transactions page with outlet ID as filter
    setLocation(`/transactions?outlet=${outlet.id}&outletName=${encodeURIComponent(outlet.name)}`);
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
    <div className="p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-league">Manajemen Outlet</h1>
          <p className="text-gray-600 font-league">
            Kelola semua outlet dan cabang bisnis Anda
          </p>
        </div>
        <Dialog open={showAddOutlet} onOpenChange={setShowAddOutlet}>
          <DialogTrigger asChild>
            <Button className="btn-orange font-league" onClick={() => {
              setEditingOutlet(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-league">
                {editingOutlet ? 'Edit Outlet' : 'Tambah Outlet Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-league">Nama Outlet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama outlet"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address" className="font-league">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-league">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              <div>
                <Label htmlFor="managerId" className="font-league">Manager</Label>
                <div className="space-y-2">
                  <Select 
                    value={formData.managerId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih manager outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Belum ada manager</SelectItem>
                      {managers?.map((manager: any) => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          {manager.name} - {manager.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddManager(true)}
                    className="w-full text-[#f29716] border-[#f29716] hover:bg-[#f29716] hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Manager Baru
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddOutlet(false);
                    setEditingOutlet(null);
                    resetForm();
                  }}
                  className="font-league"
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  className="btn-orange font-league"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingOutlet ? 'Update Outlet' : 'Tambah Outlet'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets?.map((outlet: any) => (
          <Card key={outlet.id} className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f29716] rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-league">{outlet.name}</CardTitle>
                    <Badge variant={outlet.isActive ? "default" : "secondary"}>
                      {outlet.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(outlet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(outlet)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              {outlet.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">{outlet.address}</p>
                </div>
              )}

              {/* Phone */}
              {outlet.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">{outlet.phone}</p>
                </div>
              )}

              {/* Manager */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {outlet.managerName || 'Belum ada manager'}
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-league">Omzet Bulan Ini</p>
                    <p className="font-semibold text-green-600 font-league">
                      {formatCurrency(outlet.currentMonthSales || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-league">Transaksi</p>
                    <p className="font-semibold text-gray-900 font-league">
                      {outlet.totalTransactions || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-league"
                  onClick={() => handleViewDetail(outlet)}
                >
                  Lihat Detail
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="font-league"
                  onClick={() => handleViewTransactions(outlet)}
                >
                  Transaksi
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {outlets?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 font-league">Belum ada outlet yang terdaftar</p>
            <Button 
              className="btn-orange font-league"
              onClick={() => setShowAddOutlet(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Outlet Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-league flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-[#f29716]" />
              <span>Detail Outlet - {selectedOutlet?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOutlet && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-league text-gray-600">Nama Outlet</Label>
                  <p className="font-semibold">{selectedOutlet.name}</p>
                </div>
                <div>
                  <Label className="font-league text-gray-600">Status</Label>
                  <div>
                    <Badge variant={selectedOutlet.isActive ? "default" : "secondary"}>
                      {selectedOutlet.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <Label className="font-league text-gray-600">Alamat</Label>
                    <p className="text-sm">{selectedOutlet.address || 'Belum ada alamat'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <Label className="font-league text-gray-600">Telepon</Label>
                    <p className="text-sm">{selectedOutlet.phone || 'Belum ada nomor telepon'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <Label className="font-league text-gray-600">Manager</Label>
                    <p className="text-sm">{selectedOutlet.managerName || 'Belum ada manager'}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border-t pt-4">
                <Label className="font-league text-gray-600 mb-3 block">Performa Outlet</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-league">Omzet Bulan Ini</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(selectedOutlet.currentMonthSales || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-league">Target Bulanan</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(selectedOutlet.monthlyTarget || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-league">Transaksi Bulan Ini</p>
                    <p className="text-lg font-bold text-purple-700">
                      {selectedOutlet.totalTransactions || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 font-league">Pencapaian Target</p>
                    <p className="text-lg font-bold text-orange-700">
                      {selectedOutlet.monthlyTarget ? Math.round(((selectedOutlet.currentMonthSales || 0) / selectedOutlet.monthlyTarget) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailModal(false)}
                  className="font-league"
                >
                  Tutup
                </Button>
                <Button 
                  className="btn-orange font-league"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedOutlet);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Outlet
                </Button>
                <Button 
                  variant="outline"
                  className="font-league"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewTransactions(selectedOutlet);
                  }}
                >
                  Lihat Transaksi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Manager Modal */}
      <Dialog open={showAddManager} onOpenChange={setShowAddManager}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-league">Tambah Manager Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddManager} className="space-y-4">
            <div>
              <Label htmlFor="managerName" className="font-league">Nama Manager</Label>
              <Input
                id="managerName"
                value={managerData.name}
                onChange={(e) => setManagerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama lengkap manager"
                required
              />
            </div>

            <div>
              <Label htmlFor="managerEmail" className="font-league">Email</Label>
              <Input
                id="managerEmail"
                type="email"
                value={managerData.email}
                onChange={(e) => setManagerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="manager@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="managerPhone" className="font-league">Nomor Telepon</Label>
              <Input
                id="managerPhone"
                value={managerData.phone}
                onChange={(e) => setManagerData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="081234567890"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddManager(false);
                  resetManagerForm();
                }}
                className="font-league"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="btn-orange font-league"
                disabled={createManagerMutation.isPending}
              >
                {createManagerMutation.isPending ? 'Menambahkan...' : 'Tambah Manager'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
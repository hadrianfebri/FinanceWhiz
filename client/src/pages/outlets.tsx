import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    managerId: "",
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

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      managerId: "",
    });
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
      managerId: formData.managerId ? parseInt(formData.managerId) : null,
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
      managerId: outlet.managerId ? outlet.managerId.toString() : "",
    });
    setShowAddOutlet(true);
  };

  const handleDelete = (outlet: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus outlet "${outlet.name}"?`)) {
      deleteMutation.mutate(outlet.id);
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
            <Button className="btn-orange font-league" onClick={() => setEditingOutlet(null)}>
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
                <Select 
                  value={formData.managerId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih manager outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Belum ada manager</SelectItem>
                    {managers?.map((manager: any) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.name} - {manager.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      {formatCurrency(outlet.monthlyRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-league">Transaksi</p>
                    <p className="font-semibold text-gray-900 font-league">
                      {outlet.monthlyTransactions || 0}
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
                  onClick={() => toast({
                    title: "Info",
                    description: "Fitur detail outlet akan segera tersedia"
                  })}
                >
                  Lihat Detail
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="font-league"
                  onClick={() => toast({
                    title: "Info", 
                    description: "Filter transaksi per outlet akan segera tersedia"
                  })}
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
    </div>
  );
}
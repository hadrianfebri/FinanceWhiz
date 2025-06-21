import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, Phone, Mail, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Vendors() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
    queryFn: () => fetch('/api/vendors').then(res => res.json())
  });

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
          <h1 className="text-3xl font-bold text-gray-900 font-league">Manajemen Vendor</h1>
          <p className="text-gray-600 mt-1 font-league">Kelola supplier dan vendor bisnis Anda</p>
        </div>
        <Button className="bg-[#f29716] hover:bg-[#d4820a] font-league">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor: any) => (
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
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="font-league">{vendor.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="font-league">{vendor.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-league">Payment Terms: {vendor.paymentTerms} hari</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
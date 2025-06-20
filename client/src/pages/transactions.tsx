import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Download, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AddTransactionModal from "@/components/modals/add-transaction-modal";

interface TransactionFilters {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: string;
  search: string;
  page: number;
  limit: number;
}

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: "",
    endDate: "",
    categoryId: "",
    type: "",
    search: "",
    page: 1,
    limit: 10,
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/transactions", filters],
    queryFn: () => {
      // Transform filters for API compatibility
      const apiFilters = {
        page: filters.page,
        limit: filters.limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        categoryId: filters.categoryId && filters.categoryId !== 'all' ? parseInt(filters.categoryId) : undefined,
        type: filters.type && filters.type !== 'all' ? filters.type : undefined,
        search: filters.search || undefined
      };
      return api.getTransactions(apiFilters);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (key: keyof TransactionFilters, value: string | number) => {
    let processedValue = value;
    
    // Convert 'all' back to empty string for storage
    if (typeof value === 'string' && value === 'all') {
      processedValue = '';
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: processedValue,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1),
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = categoryName.length % colors.length;
    return colors[index];
  };

  const totalPages = Math.ceil((transactionsData?.total || 0) / filters.limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Kelola semua transaksi keuangan Anda</p>
        </div>
        <Button onClick={() => setShowAddTransaction(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <Select
                value={filters.categoryId === '' ? 'all' : filters.categoryId}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis
              </label>
              <Select
                value={filters.type === '' ? 'all' : filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Cari transaksi..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-64"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactionsData?.transactions?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Tidak ada transaksi ditemukan</p>
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsData?.transactions?.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.notes && (
                          <div className="text-sm text-gray-500">
                            {transaction.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(transaction.category?.name || 'Lainnya')}>
                          {transaction.category?.name || 'Tidak Dikategorikan'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(parseFloat(transaction.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deleteTransactionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {transactionsData?.total > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Menampilkan {((filters.page - 1) * filters.limit) + 1} sampai{' '}
                  {Math.min(filters.page * filters.limit, transactionsData.total)} dari{' '}
                  {transactionsData.total} transaksi
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    Halaman {filters.page} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionModal 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
      />
    </div>
  );
}

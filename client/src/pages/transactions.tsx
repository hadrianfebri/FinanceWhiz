import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Download, Edit, Trash2, ChevronLeft, ChevronRight, Upload, FileSpreadsheet, Camera, Receipt, Filter, Building2, X } from "lucide-react";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import ImportTransactionModal from "@/components/modals/import-transaction-modal";

interface TransactionFilters {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: string;
  search: string;
  page: number;
  limit: number;
  outletId?: string;
}

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [outletFilter, setOutletFilter] = useState<{id: string, name: string} | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: "",
    endDate: "",
    categoryId: "",
    type: "",
    search: "",
    page: 1,
    limit: 10,
    outletId: "",
  });

  // Check URL parameters for outlet filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outletId = params.get('outlet');
    const outletName = params.get('outletName');
    
    if (outletId && outletName) {
      setOutletFilter({ id: outletId, name: decodeURIComponent(outletName) });
      setFilters(prev => ({ ...prev, outletId }));
    }
  }, []);

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
        search: filters.search || undefined,
        outlet: filters.outletId || undefined
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

  const handleExportExcel = () => {
    if (!transactionsData?.transactions?.length) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada transaksi untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvHeader = "Tanggal,Deskripsi,Kategori,Jenis,Jumlah,Catatan\n";
    const csvContent = transactionsData.transactions.map((transaction: any) => {
      return [
        formatDate(transaction.date),
        `"${transaction.description}"`,
        `"${transaction.category?.name || 'Tidak Dikategorikan'}"`,
        transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        transaction.amount,
        `"${transaction.notes || ''}"`
      ].join(',');
    }).join('\n');

    const fullCsv = csvHeader + csvContent;
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transaksi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Export Berhasil",
      description: "Data transaksi berhasil diekspor ke CSV",
    });
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
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      {/* Enhanced Header for UMKM */}
      <div className="card-base">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-1">Manajemen Transaksi</h2>
            <p className="text-muted-foreground dark:text-gray-400">Kelola semua transaksi keuangan usaha Anda dengan mudah</p>
            
            {/* Outlet Filter Indicator */}
            {outletFilter && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="bg-[#f29716]/10 border-[#f29716] text-[#f29716]">
                  <Building2 className="h-3 w-3 mr-1" />
                  {outletFilter.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOutletFilter(null);
                    setFilters(prev => ({ ...prev, outletId: "" }));
                    window.history.replaceState({}, '', '/transactions');
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Quick Add Transaction */}
            <Button 
              onClick={() => setShowAddTransaction(true)}
              className="btn-orange flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Catat Transaksi</span>
            </Button>
            
            {/* Import from File */}
            <Button 
              variant="outline" 
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 border-[#04474f] text-[#04474f] dark:text-[#ffde32] dark:border-[#ffde32] hover:bg-[#04474f] hover:text-white"
            >
              <Upload className="h-4 w-4" />
              <span>Import File</span>
            </Button>
            
            {/* Export Data */}
            <Button 
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 text-gray-700 dark:text-[#fafafa] dark:border-[#fafafa] hover:bg-background"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            {/* Toggle Filters */}
            <Button 
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 ${showFilters ? 'bg-muted' : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar for UMKM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base hover-lift cursor-pointer text-center p-4" onClick={() => setShowAddTransaction(true)}>
          <div className="w-12 h-12 bg-[#f29716] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-foreground dark:text-white">Scan Struk</p>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Upload foto struk</p>
        </div>
        
        <div className="card-base hover-lift cursor-pointer text-center p-4" onClick={() => setShowAddTransaction(true)}>
          <div className="w-12 h-12 bg-[#04474f] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-foreground dark:text-white">Input Manual</p>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Tambah transaksi</p>
        </div>
        
        <div className="card-base hover-lift cursor-pointer text-center p-4" onClick={() => setShowImportModal(true)}>
          <div className="w-12 h-12 bg-[#ffde32] rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="h-6 w-6 text-gray-800" />
          </div>
          <p className="font-semibold text-foreground dark:text-white">Import Excel</p>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Upload file CSV/Excel</p>
        </div>
        
        <div className="card-base hover-lift cursor-pointer text-center p-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Download className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-foreground dark:text-white">Export Data</p>
          <p className="text-xs text-muted-foreground dark:text-gray-400">Download laporan</p>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground dark:text-white mb-3">Filter Transaksi</h3>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Akhir
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Transaction Summary for UMKM */}
      {transactionsData?.transactions?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-base text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                transactionsData.transactions
                  .filter((t: any) => t.type === 'income')
                  .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total Pemasukan</p>
          </div>
          
          <div className="card-base text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                transactionsData.transactions
                  .filter((t: any) => t.type === 'expense')
                  .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Total Pengeluaran</p>
          </div>
          
          <div className="card-base text-center">
            <div className="text-2xl font-bold text-[#04474f]">
              {formatCurrency(
                transactionsData.transactions.reduce((sum: number, t: any) => {
                  return sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
                }, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">Saldo Bersih</p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactionsData?.transactions?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground dark:text-gray-400 mb-4">Tidak ada transaksi ditemukan</p>
              <Button onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background dark:bg-gray-900 border-b border-border dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Outlet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactionsData?.transactions?.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-background dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-white">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground dark:text-white">
                          {transaction.description}
                        </div>
                        {transaction.notes && (
                          <div className="text-sm text-muted-foreground dark:text-gray-400">
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
                        {transaction.outlet ? (
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-3 w-3 text-gray-400 dark:text-muted-foreground" />
                            <span className="text-sm text-muted-foreground dark:text-gray-300">{transaction.outlet.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-muted-foreground">Pusat</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(parseFloat(transaction.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingTransaction(transaction)}
                          >
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
            <div className="bg-card px-4 py-3 border-t border-border sm:px-6">
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

      {/* Import Modal */}
      <ImportTransactionModal 
        open={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <AddTransactionModal 
          open={!!editingTransaction} 
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}

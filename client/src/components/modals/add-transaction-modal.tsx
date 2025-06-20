import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { CloudUpload, Loader2, X } from "lucide-react";

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, "Nama transaksi wajib diisi"),
  amount: z.string().min(1, "Jumlah wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: any;
}

export default function AddTransactionModal({ open, onClose, transaction }: AddTransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingReceipt, setProcessingReceipt] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
    enabled: open,
  });

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'income',
      description: transaction?.description || '',
      amount: transaction?.amount || '',
      categoryId: transaction?.categoryId?.toString() || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: transaction?.notes || '',
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: FormData) => api.createTransaction(data),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processReceiptMutation = useMutation({
    mutationFn: (file: File) => api.processReceipt(file),
    onSuccess: (data) => {
      form.setValue('description', data.description);
      form.setValue('amount', data.amount.toString());
      
      // Find matching category
      const matchingCategory = categories?.find((cat: any) => 
        cat.name.toLowerCase().includes(data.category.toLowerCase())
      );
      if (matchingCategory) {
        form.setValue('categoryId', matchingCategory.id.toString());
      }

      toast({
        title: "Receipt Processed",
        description: "Data dari struk berhasil diproses dengan AI",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedType = form.watch('type');
  const filteredCategories = categories?.filter((cat: any) => cat.type === selectedType) || [];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "File tidak valid",
        description: "Hanya file gambar yang diperbolehkan",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setProcessingReceipt(true);
    
    try {
      await processReceiptMutation.mutateAsync(file);
    } finally {
      setProcessingReceipt(false);
    }
  };

  const onSubmit = (data: TransactionForm) => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('amount', data.amount);
    formData.append('categoryId', data.categoryId);
    formData.append('date', data.date);
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (selectedFile) {
      formData.append('receipt', selectedFile);
    }

    createTransactionMutation.mutate(formData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Catat Transaksi Baru</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="income" />
                        <Label htmlFor="income">Pemasukan</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="expense" />
                        <Label htmlFor="expense">Pengeluaran</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Transaksi</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: Penjualan produk A" 
                      {...field}
                      disabled={createTransactionMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      disabled={createTransactionMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      disabled={createTransactionMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Upload Struk (Opsional)
              </Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                  disabled={processingReceipt || createTransactionMutation.isPending}
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  {processingReceipt ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                      <p className="text-sm text-gray-600">Memproses struk dengan AI...</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center">
                      <CloudUpload className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">{selectedFile.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <CloudUpload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk upload atau drag & drop</p>
                      <p className="text-xs text-gray-500 mt-1">AI akan membantu mengisi data dari struk</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="Tambahkan catatan..." 
                      {...field}
                      disabled={createTransactionMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
                disabled={createTransactionMutation.isPending}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createTransactionMutation.isPending || processingReceipt}
              >
                {createTransactionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

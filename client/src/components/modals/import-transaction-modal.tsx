import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { CloudUpload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ImportTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportTransactionModal({ open, onClose }: ImportTransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate upload progress
      const formData = new FormData();
      formData.append('file', file);
      
      // Mock progress for demo
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Here you would implement actual API call for file import
      return { imported: 25, skipped: 3, errors: 1 };
    },
    onSuccess: (result) => {
      toast({
        title: "Import Berhasil",
        description: `${result.imported} transaksi berhasil diimpor, ${result.skipped} dilewati, ${result.errors} error`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Import Gagal",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format File Tidak Didukung",
        description: "Gunakan file CSV atau Excel (.xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = `Tanggal,Jenis,Deskripsi,Jumlah,Kategori,Catatan
2024-01-01,income,Penjualan Produk A,50000,Penjualan,
2024-01-02,expense,Beli Bahan Baku,25000,Bahan Baku,
2024-01-03,income,Penjualan Produk B,75000,Penjualan,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_transaksi.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-league">Import Transaksi dari File</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Format Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 font-league">Format yang Didukung</h3>
                  <p className="text-sm text-gray-600 mt-1">CSV, Excel (.xlsx, .xls) - Maksimal 5MB</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 font-league" 
                    onClick={downloadTemplate}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-[#f29716] bg-orange-50'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-gray-900 font-league">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <CloudUpload className={`h-12 w-12 mx-auto ${dragActive ? 'text-[#f29716]' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900 font-league">
                    Drop file di sini atau klik untuk pilih
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag & drop file CSV atau Excel Anda
                  </p>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer font-league" asChild>
                    <span>Pilih File</span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {importMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-league">Mengimport transaksi...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#f29716] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 font-league mb-2">Petunjuk Import:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Kolom yang diperlukan: Tanggal, Jenis, Deskripsi, Jumlah, Kategori</li>
              <li>• Jenis: "income" untuk pemasukan, "expense" untuk pengeluaran</li>
              <li>• Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)</li>
              <li>• Jumlah dalam angka tanpa titik/koma (contoh: 50000)</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={importMutation.isPending}
              className="font-league"
            >
              Batal
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || importMutation.isPending}
              className="btn-orange font-league"
            >
              {importMutation.isPending ? 'Mengimport...' : 'Import Transaksi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
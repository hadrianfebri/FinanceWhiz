import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, TrendingUp, FileText, Smartphone, Shield, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartLine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">FinSmart Lite</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Kelola Keuangan UMKM Anda dengan <span className="text-primary">Mudah</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            FinSmart Lite adalah aplikasi keuangan berbasis AI yang membantu pelaku UMKM 
            mencatat transaksi, memantau arus kas, dan menghasilkan laporan keuangan secara otomatis.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Mulai Gratis Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sudah Punya Akun?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Fitur Lengkap untuk UMKM
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola keuangan bisnis dalam satu platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Interaktif</h3>
              <p className="text-gray-600">
                Pantau kesehatan keuangan bisnis Anda dengan dashboard yang mudah dipahami
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pencatatan Mudah</h3>
              <p className="text-gray-600">
                Catat transaksi dengan cepat, bahkan bisa upload foto struk untuk auto-fill
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Laporan Otomatis</h3>
              <p className="text-gray-600">
                Generate laporan keuangan profesional dengan sekali klik
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartLine className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
              <p className="text-gray-600">
                Dapatkan insight cerdas dan rekomendasi untuk mengoptimalkan keuangan
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keamanan Terjamin</h3>
              <p className="text-gray-600">
                Data keuangan Anda aman dengan enkripsi tingkat bank
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support 24/7</h3>
              <p className="text-gray-600">
                Tim support siap membantu Anda kapan saja melalui berbagai channel
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Mengelola Keuangan dengan Lebih Baik?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bergabung dengan ribuan UMKM yang sudah merasakan manfaatnya
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Mulai Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <ChartLine className="h-8 w-8" />
            <span className="text-2xl font-bold">FinSmart Lite</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 FinSmart Lite. Semua hak dilindungi.</p>
            <p className="mt-2">Dibuat khusus untuk UMKM Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

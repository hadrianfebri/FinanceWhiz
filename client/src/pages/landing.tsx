import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, Smartphone, Shield, Users, Zap, BarChart3 } from "lucide-react";
import financewhizLogo from "@/assets/FINANCEWHIZ_COLOR.svg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f29716]/5 via-[#ffde32]/5 to-[#04474f]/5" style={{
      backgroundImage: `
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 35px,
          rgba(4, 71, 79, 0.02) 35px,
          rgba(4, 71, 79, 0.02) 70px
        )
      `
    }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={financewhizLogo} 
              alt="FinanceWhiz.AI Logo" 
              className="w-10 h-10"
            />
            <div>
              <span className="text-2xl font-bold text-gray-900 font-league">FinanceWhiz.AI</span>
              <div className="text-xs text-gray-500 font-league">AI-Powered Finance</div>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="font-league border-[#f29716] text-[#f29716] hover:bg-[#f29716] hover:text-white">Masuk</Button>
            </Link>
            <Link href="/register">
              <button className="btn-orange">Daftar Gratis</button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="badge-yellow font-league">Terpercaya oleh 1000+ UMKM</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 font-league">
            Kelola Keuangan UMKM Anda dengan <span className="text-[#f29716]">AI Cerdas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-league leading-relaxed">
            FinanceWhiz.AI adalah aplikasi keuangan berbasis AI yang membantu pelaku UMKM 
            mencatat transaksi, memantau arus kas, dan menghasilkan laporan keuangan secara otomatis.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <button className="btn-orange text-lg px-8 py-4">
                Mulai Gratis Sekarang
              </button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-league border-[#04474f] text-[#04474f] hover:bg-[#04474f] hover:text-white">
                Sudah Punya Akun?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="badge-yellow font-league">Fitur Terlengkap</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-league">
            Fitur Lengkap untuk UMKM
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-league">
            Semua yang Anda butuhkan untuk mengelola keuangan bisnis dalam satu platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card-base hover-lift text-center">
            <div className="w-16 h-16 bg-[#f29716]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-[#f29716]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-league">Dashboard Interaktif</h3>
            <p className="text-gray-600 font-league">
              Pantau kesehatan keuangan bisnis Anda dengan dashboard yang mudah dipahami
            </p>
          </div>

          <div className="card-base hover-lift text-center">
            <div className="w-16 h-16 bg-[#04474f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-[#04474f]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-league">Pencatatan Mudah</h3>
            <p className="text-gray-600 font-league">
              Catat transaksi dengan cepat, bahkan bisa upload foto struk untuk auto-fill
            </p>
          </div>

          <div className="card-base hover-lift text-center">
            <div className="w-16 h-16 bg-[#f29716]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-[#f29716]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-league">Laporan Otomatis</h3>
            <p className="text-gray-600 font-league">
              Generate laporan keuangan profesional dengan sekali klik
            </p>
          </div>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-[#f29716]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-[#f29716]" />
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
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img 
              src={financewhizLogo} 
              alt="FinanceWhiz.AI Logo" 
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold font-league">FinanceWhiz.AI</span>
          </div>
          <div className="text-center text-gray-400">
            <p className="font-league">&copy; 2024 FinanceWhiz.AI. Semua hak dilindungi.</p>
            <p className="mt-2">Dibuat khusus untuk UMKM Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

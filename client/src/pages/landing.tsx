import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, Smartphone, Shield, Users, Zap, BarChart3, Check, Star, Building2, Store, Briefcase, Crown } from "lucide-react";
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
            <span className="badge-yellow">Fitur Terlengkap</span>
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
            <h3 className="text-xl font-semibold mb-2">Dashboard Interaktif</h3>
            <p className="text-gray-600">
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

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="badge-yellow font-league">Harga Terjangkau</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-league">
            Paket SaaS untuk Setiap Kebutuhan UMKM
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-league">
            Pilih paket yang sesuai dengan skala bisnis Anda. Semua paket include trial gratis 14 hari
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Starter Package */}
          <div className="card-base hover-lift relative">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f29716]/10 rounded-lg mb-4">
                <Store className="h-6 w-6 text-[#f29716]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-league">Starter</h3>
              <p className="text-gray-600 text-sm mb-4 font-league">Perfect untuk usaha kecil</p>
              <div className="mb-6">
                <span className="text-3xl font-bold font-league">Rp 49K</span>
                <span className="text-gray-500 font-league">/bulan</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>1 Outlet/Cabang</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited Transaksi</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Dashboard & Laporan Dasar</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Upload Receipt Scanner</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Support Email</span>
                </li>
              </ul>
              
              <Link href="/register">
                <Button className="w-full btn-orange font-league">Mulai Gratis</Button>
              </Link>
            </div>
          </div>

          {/* Business Package - Most Popular */}
          <div className="card-base hover-lift relative border-2 border-[#f29716]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#f29716] text-white px-4 py-1 rounded-full text-xs font-league">Terpopuler</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#f29716]/10 rounded-lg mb-4">
                <Building2 className="h-6 w-6 text-[#f29716]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-league">Business</h3>
              <p className="text-gray-600 text-sm mb-4 font-league">Untuk bisnis berkembang</p>
              <div className="mb-6">
                <span className="text-3xl font-bold font-league">Rp 129K</span>
                <span className="text-gray-500 font-league">/bulan</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Hingga 5 Outlet/Cabang</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Multi-User (5 pengguna)</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>AI Insights & Forecasting</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Inventory Management</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Export Data Excel/PDF</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Support Chat & Phone</span>
                </li>
              </ul>
              
              <Link href="/register">
                <Button className="w-full btn-orange font-league">Pilih Business</Button>
              </Link>
            </div>
          </div>

          {/* Professional Package */}
          <div className="card-base hover-lift relative">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#04474f]/10 rounded-lg mb-4">
                <Briefcase className="h-6 w-6 text-[#04474f]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-league">Professional</h3>
              <p className="text-gray-600 text-sm mb-4 font-league">Untuk UKM menengah</p>
              <div className="mb-6">
                <span className="text-3xl font-bold font-league">Rp 249K</span>
                <span className="text-gray-500 font-league">/bulan</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited Outlets</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Multi-User (15 pengguna)</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Advanced Analytics & Reports</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>API Integration</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Tax Management</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Priority Support 24/7</span>
                </li>
              </ul>
              
              <Link href="/register">
                <Button className="w-full border-[#04474f] text-[#04474f] hover:bg-[#04474f] hover:text-white font-league" variant="outline">Pilih Professional</Button>
              </Link>
            </div>
          </div>

          {/* Enterprise Package */}
          <div className="card-base hover-lift relative bg-gradient-to-br from-[#f29716]/5 to-[#ffde32]/5">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#f29716] to-[#ffde32] rounded-lg mb-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-league">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-4 font-league">Untuk bisnis besar</p>
              <div className="mb-6">
                <span className="text-3xl font-bold font-league">Custom</span>
                <span className="text-gray-500 font-league text-sm block">Hubungi sales</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Custom Deployment</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited Users</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>White-label Solution</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Custom Features</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>On-site Training</span>
                </li>
              </ul>
              
              <Button className="w-full bg-gradient-to-r from-[#f29716] to-[#ffde32] text-white font-league">Hubungi Sales</Button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 font-league">Fitur Unggulan Semua Paket</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2 font-league">Keamanan Bank-Grade</h4>
              <p className="text-sm text-gray-600">Enkripsi SSL 256-bit & compliance GDPR</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2 font-league">Mobile Ready</h4>
              <p className="text-sm text-gray-600">Akses di mana saja via web & mobile app</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2 font-league">Real-time Analytics</h4>
              <p className="text-sm text-gray-600">Dashboard dan insights real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="badge-yellow font-league">Testimoni</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-league">
              Dipercaya oleh UMKM di Seluruh Indonesia
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-league">
              Dengar langsung dari para pengusaha yang telah merasakan manfaat FinanceWhiz.AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card-base p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 font-league">
                "Sejak pakai FinanceWhiz.AI, saya bisa track semua transaksi cabang dari HP. Laporan keuangan jadi otomatis dan AI-nya kasih insight yang berguna banget!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#f29716] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">BP</span>
                </div>
                <div>
                  <p className="font-semibold font-league">Budi Prasetyo</p>
                  <p className="text-sm text-gray-500">Owner Warung Makan Sederhana</p>
                </div>
              </div>
            </div>

            <div className="card-base p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 font-league">
                "Dulu ribet banget atur keuangan 3 toko. Sekarang dengan FinanceWhiz.AI, semua terpusat dan bisa monitor real-time. Omzet naik 30% dalam 6 bulan!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#04474f] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">SA</span>
                </div>
                <div>
                  <p className="font-semibold font-league">Sari Andini</p>
                  <p className="text-sm text-gray-500">Owner Toko Fashion Modern</p>
                </div>
              </div>
            </div>

            <div className="card-base p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 font-league">
                "Fitur AI fraud detection-nya keren! Berhasil detect ada yang manipulasi transaksi. Support tim juga responsif 24/7. Recommended banget!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#ffde32] rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-800 font-semibold">RT</span>
                </div>
                <div>
                  <p className="font-semibold font-league">Rahman Tanjung</p>
                  <p className="text-sm text-gray-500">Owner Bengkel Motor Chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="badge-yellow font-league">FAQ</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-league">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-league">
            Temukan jawaban untuk pertanyaan umum tentang FinanceWhiz.AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Apakah data keuangan saya aman?</h3>
            <p className="text-gray-600 font-league">
              Ya, kami menggunakan enkripsi bank-grade SSL 256-bit dan compliance dengan standar keamanan internasional. Data Anda disimpan di server cloud yang aman dan ter-backup otomatis.
            </p>
          </div>

          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Bisakah saya mencoba gratis dulu?</h3>
            <p className="text-gray-600 font-league">
              Tentu! Semua paket include trial gratis 14 hari tanpa perlu kartu kredit. Anda bisa explore semua fitur dan memutuskan paket yang tepat untuk bisnis Anda.
            </p>
          </div>

          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Bagaimana cara migrasi data dari sistem lama?</h3>
            <p className="text-gray-600 font-league">
              Tim support kami akan membantu proses migrasi data secara gratis untuk paket Business ke atas. Kami support import dari Excel, CSV, dan sistem akuntansi populer lainnya.
            </p>
          </div>

          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Apakah bisa digunakan offline?</h3>
            <p className="text-gray-600 font-league">
              FinanceWhiz.AI adalah aplikasi cloud-based yang memerlukan koneksi internet. Namun, semua data ter-sync otomatis dan Anda bisa akses dari device manapun kapan saja.
            </p>
          </div>

          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Bagaimana dengan pelatihan untuk tim saya?</h3>
            <p className="text-gray-600 font-league">
              Kami menyediakan onboarding session gratis, dokumentasi lengkap, video tutorial, dan webinar berkala. Untuk paket Enterprise, tersedia on-site training langsung.
            </p>
          </div>

          <div className="card-base p-6">
            <h3 className="font-semibold mb-3 font-league">Apakah ada biaya tersembunyi?</h3>
            <p className="text-gray-600 font-league">
              Tidak ada biaya tersembunyi. Harga yang tertera sudah all-inclusive dengan semua fitur sesuai paket. Anda hanya bayar upgrade storage jika melebihi quota (jarang terjadi).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#f29716] to-[#ffde32] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-league">
            Siap Transformasi Digital Keuangan UMKM Anda?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-league">
            Bergabung dengan 1000+ UMKM yang sudah merasakan manfaat AI-powered finance management
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#f29716] hover:bg-gray-100 px-8 py-4 font-league">
                Mulai Trial Gratis 14 Hari
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#f29716] px-8 py-4 font-league">
              Jadwalkan Demo
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-75 font-league">
            Tidak perlu kartu kredit • Setup dalam 5 menit • Support 24/7
          </p>
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

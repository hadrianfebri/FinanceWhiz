-- Seed data for FinanceWhiz.AI demo
-- Add more categories for both income and expense

INSERT INTO categories (name, type, user_id) VALUES
-- Income categories
('Penjualan Produk', 'income', 1),
('Jasa Konsultasi', 'income', 1),
('Komisi Penjualan', 'income', 1),
('Pendapatan Lain', 'income', 1),
-- Expense categories
('Pembelian Stok', 'expense', 1),
('Biaya Operasional', 'expense', 1),
('Marketing & Promosi', 'expense', 1),
('Transportasi', 'expense', 1),
('Utilitas (Listrik/Air)', 'expense', 1),
('Sewa Tempat', 'expense', 1),
('Gaji Karyawan', 'expense', 1),
('Peralatan & Supplies', 'expense', 1);

-- Add realistic transactions for the past 3 months
INSERT INTO transactions (user_id, category_id, amount, description, notes, type, date) VALUES
-- January 2025 transactions
(1, 5, '25000000', 'Penjualan Produk A - Batch Januari', 'Penjualan reguler bulan Januari', 'income', '2025-01-05'),
(1, 5, '18500000', 'Penjualan Produk B - Minggu 1', 'Target tercapai', 'income', '2025-01-08'),
(1, 9, '12000000', 'Pembelian bahan baku utama', 'Stock untuk produksi 2 minggu', 'expense', '2025-01-10'),
(1, 14, '3500000', 'Biaya iklan Facebook & Instagram', 'Campaign bulan Januari', 'expense', '2025-01-12'),
(1, 6, '8500000', 'Jasa konsultasi bisnis', 'Klien PT ABC', 'income', '2025-01-15'),
(1, 12, '2200000', 'Gaji karyawan part-time', 'Gaji bulan Januari', 'expense', '2025-01-16'),
(1, 5, '32000000', 'Penjualan besar ke distributor', 'Order khusus distributor Jakarta', 'income', '2025-01-18'),
(1, 15, '1800000', 'Bensin & biaya transportasi', 'Pengiriman produk', 'expense', '2025-01-20'),
(1, 16, '850000', 'Tagihan listrik & air', 'Utility bulan Januari', 'expense', '2025-01-22'),
(1, 5, '16500000', 'Penjualan online marketplace', 'Tokopedia & Shopee', 'income', '2025-01-25'),
(1, 13, '4200000', 'Sewa tempat usaha', 'Sewa bulan Januari', 'expense', '2025-01-28'),

-- February 2025 transactions
(1, 5, '28500000', 'Penjualan Produk A - Februari', 'Peningkatan dari bulan lalu', 'income', '2025-02-02'),
(1, 9, '15000000', 'Pembelian stok tambahan', 'Antisipasi peningkatan demand', 'expense', '2025-02-05'),
(1, 5, '22000000', 'Penjualan produk premium', 'Launching produk baru', 'income', '2025-02-08'),
(1, 14, '4500000', 'Campaign marketing Valentine', 'Promosi spesial Valentine', 'expense', '2025-02-10'),
(1, 6, '12500000', 'Konsultasi strategi bisnis', 'Klien PT XYZ', 'income', '2025-02-12'),
(1, 17, '2800000', 'Pembelian peralatan kantor', 'Laptop & printer baru', 'expense', '2025-02-14'),
(1, 7, '5500000', 'Komisi dari penjualan afiliasi', 'Komisi partner marketing', 'income', '2025-02-16'),
(1, 12, '2200000', 'Gaji karyawan part-time', 'Gaji bulan Februari', 'expense', '2025-02-18'),
(1, 5, '35000000', 'Penjualan besar Valentine', 'Peak season Valentine', 'income', '2025-02-20'),
(1, 15, '2200000', 'Ongkos kirim & transportasi', 'Pengiriman pesanan Valentine', 'expense', '2025-02-22'),
(1, 16, '920000', 'Tagihan listrik & air', 'Utility bulan Februari', 'expense', '2025-02-24'),
(1, 13, '4200000', 'Sewa tempat usaha', 'Sewa bulan Februari', 'expense', '2025-02-26'),

-- March 2025 transactions
(1, 5, '31000000', 'Penjualan reguler Maret', 'Konsisten dengan target', 'income', '2025-03-03'),
(1, 9, '18500000', 'Pembelian bahan baku premium', 'Kualitas lebih baik untuk produk premium', 'expense', '2025-03-05'),
(1, 5, '26500000', 'Penjualan marketplace', 'Performa bagus di e-commerce', 'income', '2025-03-08'),
(1, 6, '15000000', 'Proyek konsultasi besar', 'Kontrak 3 bulan dengan klien korporat', 'income', '2025-03-10'),
(1, 14, '6000000', 'Iklan Google Ads & SEO', 'Investasi digital marketing', 'expense', '2025-03-12'),
(1, 7, '8500000', 'Komisi penjualan Q1', 'Bonus pencapaian target', 'income', '2025-03-15'),
(1, 12, '2500000', 'Gaji karyawan + bonus', 'Gaji Maret + bonus kinerja', 'expense', '2025-03-16'),
(1, 5, '42000000', 'Penjualan ke klien enterprise', 'Deal besar dengan perusahaan besar', 'income', '2025-03-18'),
(1, 15, '2800000', 'Biaya logistik & pengiriman', 'Pengiriman pesanan besar', 'expense', '2025-03-20'),
(1, 17, '3200000', 'Upgrade peralatan produksi', 'Investasi mesin baru', 'expense', '2025-03-22'),
(1, 16, '980000', 'Tagihan listrik & air', 'Utility bulan Maret', 'expense', '2025-03-24'),
(1, 13, '4200000', 'Sewa tempat usaha', 'Sewa bulan Maret', 'expense', '2025-03-26'),

-- Recent transactions (June 2025)
(1, 5, '38000000', 'Penjualan Juni - Minggu 1', 'Target Q2 on track', 'income', '2025-06-02'),
(1, 9, '22000000', 'Pembelian stok semester 2', 'Persiapan target H2', 'expense', '2025-06-05'),
(1, 6, '18500000', 'Konsultasi digital transformation', 'Proyek modernisasi klien', 'income', '2025-06-08'),
(1, 5, '45000000', 'Penjualan produk unggulan', 'Product best seller bulan ini', 'income', '2025-06-10'),
(1, 14, '7500000', 'Campaign mid-year sale', 'Promosi tengah tahun', 'expense', '2025-06-12'),
(1, 7, '12000000', 'Komisi partnership deal', 'Revenue sharing dengan partner strategis', 'income', '2025-06-14'),
(1, 12, '3000000', 'Gaji karyawan Juni', 'Gaji reguler + tunjangan', 'expense', '2025-06-16'),
(1, 8, '8500000', 'Pendapatan dari investasi', 'Return dari portfolio investasi', 'income', '2025-06-18'),
(1, 15, '3200000', 'Ekspansi wilayah pengiriman', 'Biaya logistik area baru', 'expense', '2025-06-20');
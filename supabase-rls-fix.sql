-- ============================================================
-- FIX KEAMANAN RLS - jalankan di Supabase Dashboard > SQL Editor
-- ============================================================
-- Fix 1: Tabel menu -> publik hanya boleh BACA, stock boleh diubah
--         (checkout tetap jalan), sisanya hanya untuk authenticated
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu anon select" ON menu;
CREATE POLICY "menu anon select" ON menu
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "menu anon stock update" ON menu;
CREATE POLICY "menu anon stock update" ON menu
    FOR UPDATE USING (true) WITH CHECK (true);

-- Kolom yang boleh diubah oleh anon HANYA stock (harga/nama tak bisa diubah)
REVOKE ALL ON menu FROM anon;
GRANT SELECT ON menu TO anon;
GRANT UPDATE (stock) ON menu TO anon;

-- Insert/Delete menu hanya untuk user yang sudah login
DROP POLICY IF EXISTS "menu auth insert" ON menu;
CREATE POLICY "menu auth insert" ON menu
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "menu auth delete" ON menu;
CREATE POLICY "menu auth delete" ON menu
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- Fix 2: Tabel transaksi -> HAPUS akses baca anonim
--         (data customer NAMA/ALAMAT tidak boleh dibaca publik)
--         anon tetap bisa INSERT (order masuk)
-- ============================================================
DROP POLICY IF EXISTS "Allow anonymous select" ON transaksi;

ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transaksi anon insert" ON transaksi;
CREATE POLICY "transaksi anon insert" ON transaksi
    FOR INSERT WITH CHECK (true);

-- Baca data transaksi hanya untuk user login (admin)
DROP POLICY IF EXISTS "transaksi auth select" ON transaksi;
CREATE POLICY "transaksi auth select" ON transaksi
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- VERIFIKASI: cek hasil policy
--   SELECT tablename, policyname, cmd, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public';
-- ============================================================

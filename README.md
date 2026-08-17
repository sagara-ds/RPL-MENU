<h1 style="color:orange;">RPL-<span style="blue">Menu</span></h1>
<p>This project was started on august 5th, 2026.</p>
<p>The purpose of this website development was for the sake of</p>
<p>my whole class in the preparation for the school bazaar that take</p>
<p>place in SMKN 1 Ciamis. The main idea was to promote our major to the</p>
<p>whole schools with this creation. RPL-Menu is website to take online</p>
<p>orders in the area of the school facility. The website is mostly</p>
<p>the develop for the mobile users, but we still make it responsive for</p>
<p>other media too. Alhamdulillah, the project can be done on time.</p>
<p>Thank you, feel free to take a look on our code.</p>
<hr>

<h2>Setup Kunci Supabase</h2>
<p>Kunci Supabase <b>tidak ikut di-commit</b> (lihat <code>.gitignore</code>). Sebelum menjalankan website:</p>
<ol>
  <li>Salin <code>assets/js/config.example.js</code> menjadi <code>assets/js/config.js</code></li>
  <li>Isi <code>window.SUPABASE_URL</code> dan <code>window.SUPABASE_KEY</code> dengan kunci proyek Supabase kamu</li>
</ol>
<p>Jangan pernah commit <code>config.js</code> ke repository.</p>

<h2>Keamanan Database (RLS)</h2>
<p>Setelah membuat tabel di Supabase, jalankan <code>supabase-rls-fix.sql</code> di <b>Supabase Dashboard &gt; SQL Editor</b> untuk mengunci akses:</p>
<ul>
  <li>Tabel <code>menu</code>: publik hanya bisa baca + update kolom <code>stock</code></li>
  <li>Tabel <code>transaksi</code>: publik hanya bisa insert, data customer tidak bisa dibaca publik</li>
</ul>
<hr>
<p><b><i>-Barakuda_black</i></b></p>
<hr>
<h1>The Members of Barakuda_black</h1>
<div style="display:inline; justify-content:space-between; align-items:center;">
  <h3>Handling: Backend</h3>
  <img src="assets\image\IMG-20260216-WA0285.jpg" style="height:auto; width:8rem; border-radius:100%;">
  <a href="https://github.com/sagara-ds"><p>Sagara Dwi Septiansyah</p></a>
  <h3>Handling: Database</h3>
  <img src="assets\image\Screenshot 2026-08-05 204705.png" style="height:auto; width:8rem; border-radius:100%;">
  <a href="https://github.com/sayyidlghzl-ctrl"><p>M. Sayyid Al-Ghifari</p></a>
  <h3>Handling: Frontend</h3>
  <img src="assets\image\Screenshot 2026-08-05 205508.png" style="height:auto; width:8rem; border-radius:100%;">
  <a href="https://github.com/mikaelputra001-lang"><p>Mikael Putra Wibowo</p></a>
</div>

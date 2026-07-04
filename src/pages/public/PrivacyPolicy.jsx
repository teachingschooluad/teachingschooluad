import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--primary)' }}>
        Kebijakan Privasi (Privacy Policy)
      </h1>
      
      <p style={{ marginBottom: '16px' }}><strong>Terakhir diperbarui:</strong> 4 Mei 2026</p>

      <p style={{ marginBottom: '16px' }}>
        Aplikasi ePKL v3 ("kami", "sistem") dikembangkan dan dioperasikan oleh SMKN 1 Kawunganten. 
        Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi pengguna 
        (siswa, guru, perusahaan, dan orang tua) saat menggunakan aplikasi dan layanan kami.
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        1. Pengumpulan Data
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Sistem ini mengumpulkan data-data berikut untuk mendukung fungsionalitas utama aplikasi:
      </p>
      <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
        <li style={{ marginBottom: '8px' }}>
          <strong>Data Pribadi:</strong> Nama lengkap, NIS/NISN, kelas, jurusan, dan alamat email (jika ada).
        </li>
        <li style={{ marginBottom: '8px' }}>
          <strong>Data Lokasi (GPS):</strong> Kami mengumpulkan informasi lokasi presisi saat pengguna (siswa) melakukan presensi (check-in/check-out) harian. Data ini mutlak diperlukan untuk memverifikasi kehadiran siswa di lokasi instansi/perusahaan tempat Prakerin.
        </li>
        <li style={{ marginBottom: '8px' }}>
          <strong>Media (Foto):</strong> Kami mengumpulkan foto (kamera) saat siswa mengambil foto selfie untuk presensi, serta saat mengunggah foto dokumentasi pada fitur Jurnal Harian.
        </li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        2. Penggunaan Data
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Seluruh data yang dikumpulkan semata-mata hanya digunakan untuk keperluan internal sekolah, yaitu:
      </p>
      <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
        <li style={{ marginBottom: '8px' }}>Memantau dan mengevaluasi kedisiplinan serta kehadiran siswa selama masa Prakerin.</li>
        <li style={{ marginBottom: '8px' }}>Menilai laporan jurnal harian kegiatan siswa.</li>
        <li style={{ marginBottom: '8px' }}>Mempermudah guru pembimbing dan pihak sekolah dalam memberikan pelaporan kepada orang tua siswa.</li>
      </ul>
      <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
        Kami TIDAK PERNAH membagikan, menjual, atau mendistribusikan data lokasi dan foto Anda kepada pihak ketiga mana pun.
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        3. Keamanan Data
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Kami berkomitmen untuk melindungi data pribadi Anda. Seluruh komunikasi data antara aplikasi (baik web maupun mobile) dengan server kami dienkripsi menggunakan protokol keamanan standar (HTTPS).
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        4. Hak Akses dan Penghapusan Data
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Pengguna memiliki hak untuk meminta perbaikan atau penghapusan data akun mereka yang tersimpan di sistem kami. 
        Permintaan penghapusan data dapat diajukan secara langsung melalui administrator atau pihak sekolah SMKN 1 Kawunganten.
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        5. Perubahan pada Kebijakan Privasi
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika ada perubahan yang signifikan, kami akan memberitahukan pengguna melalui pengumuman di dalam aplikasi atau melalui instruksi langsung dari sekolah.
      </p>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px' }}>
        6. Hubungi Kami
      </h2>
      <p style={{ marginBottom: '16px' }}>
        Jika Anda memiliki pertanyaan atau kekhawatiran terkait Kebijakan Privasi ini, silakan hubungi administrator IT atau staf Tata Usaha SMKN 1 Kawunganten.
      </p>
      
      <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} ePKL SMKN 1 Kawunganten. Hak cipta dilindungi undang-undang.
      </div>
    </div>
  );
}

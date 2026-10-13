# pweb-ts-B16-2026

## Akun uji login

Gunakan salah satu akun DummyJSON berikut untuk masuk:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `emilys` | `emilyspass` |
| Admin | `michaelw` | `michaelwpass` |
| Moderator | `oliviaw` | `oliviawpass` |
| User | `averyp` | `averyppass` |
| User | `evelyns` | `evelynspass` |

## Panduan penjelasan dan presentasi

Proyek ini adalah aplikasi antrean rumah sakit sederhana dengan lima halaman HTML. Logika ditulis dalam TypeScript di folder `src/`, kemudian dikompilasi menjadi JavaScript di `dist/` untuk dijalankan browser. Data layanan, tiket, dan sesi login disimpan di Local Storage browser.

### Gambaran alur aplikasi

1. Semua pengguna harus login melalui `login.html`. Kredensial dikirim ke endpoint autentikasi DummyJSON.
2. Setelah autentikasi berhasil, aplikasi menentukan role dari respons server atau mencocokkan ID dan username pengguna ke data role di server.
3. Token, role, dan nama depan disimpan di Local Storage. Admin/moderator diarahkan ke dashboard; user diarahkan ke operator.
4. Keempat halaman selain login memeriksa sesi. Operator, ambil antrean, dan layar dapat digunakan semua role yang login. Dashboard hanya untuk admin dan moderator.
5. Dashboard mengelola layanan dan tiket. Operator mengubah status tiket. Halaman ambil antrean menerbitkan tiket, sedangkan layar menampilkan tiket yang sedang dipanggil.
6. Fungsi bersama di `src/storage.ts` menjaga format data dan aturan antrean konsisten pada dashboard, operator, ambil antrean, dan layar.

### Arul — setup, tipe data, login, dan operator

**File utama:** `tsconfig.json`, `.gitignore`, `src/types.ts`, `src/auth.ts`, `login.html`, `src/login.ts`, `operator.html`, `src/operator.ts`.

#### Setup dan kompilasi TypeScript

- `tsconfig.json` menetapkan target ES2022, pustaka DOM, folder sumber `src`, folder hasil `dist`, pemeriksaan ketat (`strict`), dan `noEmitOnError`. Opsi `module` menggunakan `ES2022` agar sesuai dengan compiler proyek dan kompilasi berjalan. Aplikasi tidak menggunakan `import`/`export`; script dimuat berurutan dengan `defer`.
- `.gitignore` mengecualikan `node_modules/`, sedangkan JavaScript hasil kompilasi di `dist/` disertakan untuk digunakan halaman HTML.
- Alur kerja: ubah file `.ts`, jalankan `npx tsc`, lalu browser memuat `.js` dari `dist/`. `npx tsc --noEmit` memeriksa tipe tanpa memperbarui hasil build.

#### Kontrak tipe bersama

`src/types.ts` menetapkan bentuk dan nilai yang dipakai antarbagian:

- `RolePengguna`: `admin`, `moderator`, atau `user`.
- `PrioritasTiket`: `Normal`, `Lansia`, `Disabilitas`, atau `VIP`.
- `StatusTiket`: `Menunggu`, `Dipanggil`, `Selesai`, atau `Dilewati`.
- `JenisAntrian`: layanan dengan `kode`, `nama`, `aktif`, dan `nomorTerakhir`.
- `TiketAntrian`: tiket dengan kode layanan, nomor, label, prioritas, dan status.
- `ResponsLogin`, `PenggunaAPI`, dan `ResponsFilterPengguna`: bentuk data yang diharapkan dari API DummyJSON.

Tipe membantu compiler menemukan ketidaksesuaian saat pengembangan, tetapi bukan validasi otomatis terhadap data yang tersimpan di Local Storage saat runtime.

#### Login, role, dan guard

Di `src/login.ts`, `mulaiLogin` memasang handler submit, mencegah reload halaman, mengunci tombol selama permintaan, lalu mengirim username dan password ke `https://dummyjson.com/auth/login`. Respons diperiksa agar berisi token dan identitas yang diperlukan. Kredensial salah, error server, dan masalah koneksi disampaikan sebagai pesan di halaman.

`roleDariServer` tidak menentukan role berdasarkan nama akun. Jika respons login tidak memuat role, fungsi meminta data pengguna melalui filter role dan mencocokkan ID serta username pengguna yang baru login. Setelah role valid, aplikasi menyimpan token, role, dan nama depan ke Local Storage; password tidak disimpan. Admin/moderator diarahkan ke dashboard, sedangkan user diarahkan ke operator.

Di `src/auth.ts`:

- `roleValid` memastikan role termasuk salah satu nilai yang dikenal.
- `cekLogin(false)` mengharuskan sesi valid untuk operator, halaman ambil antrean, dan layar.
- `cekLogin(true)` juga membatasi dashboard untuk admin/moderator. User yang membuka dashboard diarahkan ke operator.
- Jika token, role, atau nama tidak ada/tidak valid, pengguna diarahkan ke halaman login.
- `pasangNavigasi` menampilkan nama dan role serta memasang tombol logout. Logout menghapus hanya `token`, `role`, dan `firstName`; layanan dan tiket tetap tersimpan.

Guard membaca Local Storage di browser. Ini sesuai alur praktikum, tetapi bukan otorisasi yang aman untuk sistem produksi karena data browser dapat dimodifikasi oleh pengguna.

#### Operator

`src/operator.ts` menampilkan kartu tiap layanan beserta tiket yang sedang dipanggil, tiket berikutnya, prioritas, dan jumlah tiket menunggu. `setInterval` memperbarui tampilan setiap tiga detik agar perubahan dari tab lain dapat terlihat.

`ubahAntrian` menangani tiga aksi:

- **Panggil berikutnya:** tiket yang sedang dipanggil (jika ada) menjadi `Selesai`, kemudian tiket menunggu pilihan berikutnya menjadi `Dipanggil`.
- **Selesai:** mengubah tiket yang sedang dipanggil menjadi `Selesai` tanpa otomatis memanggil tiket lain.
- **Lewati:** mengubah tiket yang sedang dipanggil menjadi `Dilewati`, sehingga tiket itu tidak dipilih lagi sebagai tiket menunggu.

#### Alur demo Arul

1. Login dengan password salah dan tunjukkan pesan kesalahan.
2. Login sebagai user; tunjukkan bahwa ia masuk ke operator dan akses dashboard dialihkan ke operator.
3. Login sebagai admin/moderator; tunjukkan dashboard dapat dibuka.
4. Di operator, panggil tiket prioritas dan tunjukkan perubahan status serta jumlah menunggu.
5. Logout dan tunjukkan sesi dihapus, sedangkan layanan dan tiket tetap ada.

### Nadia — penyimpanan bersama dan dashboard

**File utama:** `src/storage.ts`, `index.html`, `src/admin.ts`.

#### Penyimpanan Local Storage

Local Storage hanya menyimpan string. Karena itu `bacaJenis` dan `bacaTiket` mengambil string lalu mengubahnya menjadi array memakai `JSON.parse`; `simpanJenis` dan `simpanTiket` mengubah array ke string memakai `JSON.stringify`.

- `jenisAntrian` menyimpan master layanan.
- `tiketAntrian` menyimpan tiket.
- Sesi login menggunakan kunci terpisah dan dikelola oleh autentikasi.
- Data bertahan setelah refresh pada browser dan origin yang sama, tetapi tidak otomatis tersinkron ke perangkat atau browser lain.

#### Aturan tiket

- `cariJenis` mencari layanan menurut kode; `prioritasValid` memastikan prioritas diperbolehkan.
- `formatNomor` menghasilkan nomor tiga digit, misalnya `A-001`.
- `buatTiket` membaca ulang layanan dan menolak layanan yang tidak ada/nonaktif, prioritas tidak valid, atau nomor yang telah mencapai batas 999. Tiket baru berstatus `Menunggu`.
- Nomor berikutnya diambil dari `nomorTerakhir` pada layanan, bukan dari jumlah tiket menunggu. Nomor tetap berurutan setelah tiket selesai/dilewati, dan setiap layanan memiliki urutan sendiri.
- `buatTiket` digunakan oleh dashboard dan halaman ambil antrean sehingga validasi dan penomoran tidak berbeda.
- `tiketDipanggil` mencari tiket berstatus `Dipanggil`; `jumlahMenunggu` hanya menghitung tiket berstatus `Menunggu`.
- `tiketBerikutnya` memilih tiket menunggu non-Normal yang paling awal diterbitkan. Semua prioritas non-Normal satu kelompok; tidak ada urutan VIP di atas Lansia/Disabilitas. Jika tidak ada tiket prioritas, dipilih tiket Normal paling awal.
- `isiPilihanJenis` mengisi dropdown dengan layanan aktif dan mempertahankan pilihan lama bila layanan itu masih aktif.
- `pesanError` menyediakan teks pesan untuk error yang ditampilkan di halaman.

#### Dashboard dan pengelolaan layanan

`index.html` menyediakan form tambah layanan, form tiket manual, tabel layanan, dan tombol reset. `src/admin.ts` menjalankan `cekLogin(true)` sebelum memasang fungsi dashboard, sehingga halaman dan aksi dashboard dibatasi untuk admin/moderator.

- Tambah layanan menormalkan kode menjadi huruf kapital, hanya menerima satu karakter A-Z, memangkas spasi pada nama, dan menolak kode/nama duplikat tanpa membedakan kapitalisasi.
- Layanan baru aktif dengan `nomorTerakhir` 0.
- Edit mengganti nama tanpa mengubah kode; tiket lama tetap merujuk ke identitas layanan yang sama.
- Toggle aktif/nonaktif menentukan apakah tiket baru boleh dibuat. Operator tetap dapat mengelola tiket lama pada layanan nonaktif.
- Hapus meminta konfirmasi, kemudian menghapus layanan dan tiket dengan kode layanan tersebut.
- Tiket manual menggunakan `buatTiket`, sama seperti tiket yang dibuat dari halaman ambil antrean.
- Reset meminta konfirmasi, menghapus semua tiket, dan mengatur `nomorTerakhir` semua layanan ke 0. Master layanan tidak dihapus.
- Baris tabel dibuat dengan `createElement`; nama layanan dimasukkan melalui `textContent`/`value`, bukan sebagai HTML.

#### Alur demo Nadia

1. Tambahkan dua layanan, lalu coba kode dan nama duplikat dengan perbedaan kapitalisasi.
2. Edit nama dan toggle aktif/nonaktif; tunjukkan perubahan pada pilihan layanan.
3. Terbitkan tiket manual dan bandingkan nomor dengan tiket dari halaman ambil antrean.
4. Reset antrean; tiket hilang, master layanan tetap ada, dan tiket berikutnya mulai dari 001.
5. Hapus layanan uji dan tunjukkan konfirmasi serta penghapusan tiket terkait.

### Dyfan — tampilan, ambil antrean, dan layar

**File utama:** `style.css`, `ambil-antrian.html`, `src/ambil.ts`, `layar.html`, `src/layar.ts`.

#### HTML dan CSS

Setiap HTML menyediakan struktur dan ID yang diambil oleh TypeScript. Contohnya, `ambil-antrian.html` memiliki `ambilForm`, `ambilJenis`, `ambilPrioritas`, dan area hasil tiket; `layar.html` memiliki `layarKartu` dan `fullscreenBtn`.

Script menggunakan `defer`, sehingga HTML diparsing sebelum script berjalan. Halaman ambil dan layar memuat `auth.js` sebelum kode halaman supaya fungsi guard tersedia, serta `storage.js` sebelum kode yang memakai fungsi penyimpanan. Urutan ini penting karena fungsi bersama dan halaman dimuat sebagai script biasa.

`style.css` mengatur warna, font, jarak, tombol, kartu, tabel, dan responsivitas. Grid memakai dua kolom pada layar lebar dan berubah menjadi satu kolom pada lebar maksimal 700px. `.table-wrap` membuat tabel dapat digeser horizontal. Class dan ID menjadi kontrak antara HTML, CSS, dan TypeScript.

#### Halaman ambil antrean

`src/ambil.ts` memanggil `cekLogin(false)` terlebih dahulu; tanpa sesi halaman mengarahkan pengguna ke login. Sesudah sesi valid:

- `pasangNavigasi` menampilkan identitas dan menyediakan logout.
- `perbaruiPilihan` mengecek perubahan master layanan setiap tiga detik dan membangun ulang dropdown hanya jika data layanan berubah.
- Saat form dikirim, prioritas divalidasi, lalu tiket dibuat dengan `buatTiket`.
- Karena `buatTiket` membaca ulang layanan, pemilihan layanan yang sudah dinonaktifkan sebelum submit tetap ditolak.
- Nomor tiket, nama layanan, dan prioritas ditampilkan setelah tiket berhasil dibuat.

#### Layar antrean dan Fullscreen API

`src/layar.ts` juga memeriksa login dengan `cekLogin(false)`.

- `renderLayar` membuat kartu untuk setiap layanan aktif, menampilkan tiket berstatus `Dipanggil`, dan menghitung antrean tersisa dari tiket berstatus `Menunggu`.
- `perbaruiLayar` dijalankan ketika halaman dibuka dan setiap tiga detik.
- Tombol fullscreen menjalankan Fullscreen API setelah klik pengguna. Event `fullscreenchange` mengubah teks tombol sesuai status, termasuk ketika pengguna keluar dengan Esc.
- Jika tidak ada layanan aktif, halaman menampilkan pesan. Error saat render/fullscreen ditampilkan melalui elemen pesan.

Polling ini membaca Local Storage dalam origin/browser yang sama, bukan mengambil data antrean dari server.

#### Alur demo Dyfan

1. Sebelum login, buka halaman ambil antrean dan layar; keduanya harus dialihkan ke login.
2. Sesudah login, buat tiket dari halaman ambil antrean dan tunjukkan nomor serta prioritas.
3. Nonaktifkan layanan dari dashboard; setelah polling, layanan tersebut hilang dari pilihan tiket.
4. Panggil tiket melalui operator; layar menampilkan perubahan dalam sekitar tiga detik.
5. Aktifkan fullscreen dan keluar menggunakan tombol, lalu ulangi dengan Esc.
6. Perkecil lebar browser untuk menunjukkan grid responsif satu kolom.

### Integrasi bersama dan pertanyaan presentasi

- Urutan demo keseluruhan: login/penentuan role → dashboard membuat layanan → tiket dibuat manual atau oleh pengguna → operator memanggil tiket → layar menampilkan panggilan.
- Semua role wajib login. Admin/moderator dapat membuka dashboard; semua role yang login dapat membuka operator, ambil antrean, dan layar.
- Logout menghapus sesi, reset menghapus tiket dan mengulang nomor, sedangkan hapus layanan menghapus layanan beserta tiket yang terkait.
- **Mengapa nomor disimpan pada layanan?** Supaya nomor tidak kembali ke awal hanya karena tiket telah selesai atau dilewati.
- **Apakah VIP selalu di atas Lansia/Disabilitas?** Tidak. Implementasi menjadikan semua prioritas non-Normal satu kelompok dan mempertahankan urutan penerbitan di dalamnya.
- **Mengapa layanan nonaktif masih ditampilkan operator?** Agar tiket yang sudah terbit tetap dapat diselesaikan.
- **Mengapa halaman disebut publik tetapi perlu login?** “Publik” menjelaskan fungsi halaman dalam aplikasi; revisi requirement menetapkan semua halaman harus dilindungi login.
- **Apakah guard browser aman untuk produksi?** Tidak. Local Storage dapat dimodifikasi. Sistem produksi memerlukan autentikasi, otorisasi, dan penyimpanan yang divalidasi di server.

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

#### Kode lengkap dan penjelasan per baris

Komentar di samping tiap baris hanya ditulis di README ini; file kode aslinya tidak diubah. Folder `dist/` adalah hasil kompilasi `src/` sehingga tidak diulang di sini.

##### `tsconfig.json`

```jsonc
{  // awal objek konfigurasi TypeScript
  "compilerOptions": {  // kelompok opsi untuk compiler
    "target": "ES2022",  // versi JavaScript hasil kompilasi (fitur ES2022)
    "module": "ES2022",  // format modul output ES2022 agar sesuai compiler dan kompilasi berjalan
    "lib": ["ES2022", "DOM"],  // pustaka tipe: fitur ES2022 + API browser (document, localStorage, fetch)
    "rootDir": "src",  // folder akar file sumber .ts
    "outDir": "dist",  // folder tujuan file .js hasil kompilasi
    "strict": true,  // aktifkan semua pemeriksaan tipe yang ketat
    "noEmitOnError": true,  // jangan hasilkan .js bila masih ada error tipe
    "skipLibCheck": true  // lewati pemeriksaan file deklarasi pustaka agar kompilasi lebih cepat
  },  // akhir compilerOptions
  "include": ["src/**/*.ts"]  // hanya kompilasi semua file .ts di dalam folder src
}  // akhir objek konfigurasi
```

##### `.gitignore`

```gitignore
node_modules/
```

`node_modules/` berarti folder dependensi (hasil `npm install`) diabaikan Git dan tidak ikut di-commit. File `.gitignore` tidak mendukung komentar di samping baris, sehingga penjelasannya ditulis di sini.

##### `src/types.ts`

```ts
type RolePengguna = "admin" | "moderator" | "user";  // tipe gabungan: hanya tiga role yang diperbolehkan
type PrioritasTiket = "Normal" | "Lansia" | "Disabilitas" | "VIP";  // empat prioritas tiket yang valid
type StatusTiket = "Menunggu" | "Dipanggil" | "Selesai" | "Dilewati";  // empat status siklus hidup tiket

interface JenisAntrian {  // bentuk data satu layanan (jenis antrean)
  kode: string;  // kode satu huruf layanan, misalnya "A"
  nama: string;  // nama layanan yang tampil di layar
  aktif: boolean;  // true bila layanan boleh menerbitkan tiket baru
  nomorTerakhir: number;  // nomor tiket terakhir yang terbit; dasar nomor berikutnya
}  // akhir interface JenisAntrian

interface TiketAntrian {  // bentuk data satu tiket antrean
  kodeJenis: string;  // kode layanan pemilik tiket (merujuk JenisAntrian.kode)
  nomor: number;  // nomor urut tiket dalam layanan tersebut
  label: string;  // teks nomor yang ditampilkan, misalnya "A-001"
  prioritas: PrioritasTiket;  // prioritas pemegang tiket
  status: StatusTiket;  // status tiket saat ini
}  // akhir interface TiketAntrian

interface ResponsLogin {  // bentuk respons endpoint login DummyJSON
  id: number;  // ID pengguna di server
  username: string;  // username pengguna
  firstName: string;  // nama depan, disimpan untuk ditampilkan di navigasi
  accessToken: string;  // token akses hasil autentikasi
  role?: string;  // role (opsional: tidak selalu ada di respons login)
}  // akhir interface ResponsLogin

interface PenggunaAPI {  // bentuk satu pengguna dari endpoint daftar pengguna
  id: number;  // ID pengguna di server
  username: string;  // username pengguna
  firstName: string;  // nama depan pengguna
  role: string;  // role pengguna menurut server
}  // akhir interface PenggunaAPI

interface ResponsFilterPengguna {  // bentuk respons endpoint filter pengguna
  users: PenggunaAPI[];  // daftar pengguna yang cocok dengan filter role
}  // akhir interface ResponsFilterPengguna
```

##### `src/auth.ts`

```ts
function roleValid(teks: string | null | undefined): teks is RolePengguna {  // type guard: cek apakah teks adalah role yang dikenal
  return teks === "admin" || teks === "moderator" || teks === "user";  // true hanya bila sama dengan salah satu dari tiga role
}  // akhir roleValid

function hapusSesi(): void {  // menghapus data sesi login dari Local Storage
  localStorage.removeItem("token");  // hapus token akses
  localStorage.removeItem("role");  // hapus role pengguna
  localStorage.removeItem("firstName");  // hapus nama depan pengguna
}  // akhir hapusSesi (layanan dan tiket sengaja tidak dihapus)

function cekLogin(khususAdmin: boolean): boolean {  // guard halaman; true bila boleh lanjut, khususAdmin=true untuk dashboard
  const token = localStorage.getItem("token");  // ambil token tersimpan (null bila belum login)
  const role = localStorage.getItem("role");  // ambil role tersimpan
  const nama = localStorage.getItem("firstName");  // ambil nama depan tersimpan

  if (!token || !roleValid(role) || !nama) {  // sesi dianggap tidak valid bila ada yang kosong/role tidak dikenal
    window.location.href = "login.html";  // arahkan pengguna ke halaman login
    return false;  // beri tahu pemanggil agar menghentikan eksekusi halaman
  }  // akhir pengecekan sesi

  if (khususAdmin && role !== "admin" && role !== "moderator") {  // halaman khusus admin tetapi role bukan admin/moderator
    window.location.href = "operator.html";  // alihkan user biasa ke halaman operator
    return false;  // hentikan eksekusi halaman dashboard
  }  // akhir pengecekan hak akses admin

  return true;  // sesi valid dan hak akses mencukupi
}  // akhir cekLogin

function pasangNavigasi(): void {  // mengisi identitas pengguna dan memasang tombol logout
  const identitas = document.getElementById("identitas");  // elemen teks identitas di navbar (bisa null)
  const logout = document.getElementById("logoutBtn");  // tombol logout di navbar (bisa null)

  if (identitas) {  // lanjut hanya bila elemen ada di halaman
    identitas.textContent =  // isi teks identitas dengan gabungan tiga bagian di bawah
      (localStorage.getItem("firstName") ?? "") +  // nama depan (string kosong bila tidak ada)
      " | " +  // pemisah antara nama dan role
      (localStorage.getItem("role") ?? "");  // role pengguna (string kosong bila tidak ada)
  }  // akhir pengisian identitas

  if (logout) {  // lanjut hanya bila tombol logout ada
    logout.addEventListener("click", () => {  // saat tombol logout diklik
      hapusSesi();  // hapus token, role, dan nama
      window.location.href = "login.html";  // kembali ke halaman login
    });  // akhir handler klik logout
  }  // akhir pemasangan tombol logout
}  // akhir pasangNavigasi
```

##### `login.html`

```html
<!DOCTYPE html>  <!-- deklarasi dokumen HTML5 -->
<html lang="id">  <!-- elemen akar; bahasa halaman Indonesia -->
<head>  <!-- awal bagian metadata dan resource -->
  <meta charset="UTF-8">  <!-- encoding karakter UTF-8 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- lebar layar mengikuti perangkat (responsif) -->
  <title>Login - Antrian Rumah Sakit</title>  <!-- judul tab browser -->
  <link rel="stylesheet" href="style.css">  <!-- memuat stylesheet bersama -->
  <script src="dist/auth.js" defer></script>  <!-- memuat fungsi sesi (hapusSesi, roleValid); defer = jalan setelah HTML diparsing -->
  <script src="dist/login.js" defer></script>  <!-- memuat logika login; setelah auth.js karena memakainya -->
</head>  <!-- akhir head -->
<body>  <!-- awal isi halaman -->
  <div class="container login-box">  <!-- kotak pembungkus form login (gaya dari CSS) -->
    <h1>Login</h1>  <!-- judul halaman -->
    <form id="loginForm">  <!-- form login; id dipakai login.ts -->
      <label for="username">Username</label>  <!-- label untuk input username -->
      <input id="username" type="text" required>  <!-- isian username, wajib diisi -->

      <label for="password">Password</label>  <!-- label untuk input password -->
      <input id="password" type="password" required>  <!-- isian password (disamarkan), wajib diisi -->

      <button id="loginBtn" type="submit">Masuk</button>  <!-- tombol kirim form; dikunci saat memproses -->
    </form>  <!-- akhir form login -->
    <p id="loginPesan" class="pesan"></p>  <!-- tempat pesan error login -->
    <a href="ambil-antrian.html">Ambil antrean</a>  <!-- tautan ke halaman ambil antrean -->
    <a href="layar.html">Lihat layar antrean</a>  <!-- tautan ke layar antrean -->
  </div>  <!-- akhir kotak login -->
</body>  <!-- akhir isi halaman -->
</html>  <!-- akhir dokumen -->
```

##### `src/login.ts`

```ts
async function roleDariServer(login: ResponsLogin): Promise<RolePengguna> {  // menentukan role dari server (async karena memakai fetch)
  if (roleValid(login.role)) return login.role;  // bila respons login sudah memuat role valid, langsung pakai

  // Jika respons login tidak membawa role, cocokkan ID pengguna login
  // dengan data server melalui endpoint filter yang digunakan soal.
  const daftarRole: RolePengguna[] = ["admin", "moderator", "user"];  // role yang akan dicari satu per satu di server
  for (const targetRole of daftarRole) {  // ulangi untuk setiap role
    const url = "https://dummyjson.com/users/filter?key=role&value=" +  // endpoint filter pengguna berdasarkan role
      targetRole + "&limit=0";  // nilai role yang dicari; limit=0 berarti ambil semua data
    const respons = await fetch(url);  // kirim permintaan GET dan tunggu hasilnya
    if (!respons.ok) throw new Error("Gagal mengambil role dari server.");  // status HTTP gagal: hentikan dengan error
    const data = await respons.json() as ResponsFilterPengguna;  // ubah respons JSON menjadi objek bertipe
    for (const pengguna of data.users) {  // periksa setiap pengguna dengan role tersebut
      if (pengguna.id === login.id && pengguna.username === login.username) {  // cocok bila ID dan username sama dengan yang login
        if (!roleValid(pengguna.role) || pengguna.role !== targetRole) {  // role dari server harus valid dan sesuai role yang dicari
          throw new Error("Role dari server tidak sesuai.");  // data server janggal: batalkan
        }  // akhir validasi role
        return pengguna.role;  // role ditemukan dan valid: kembalikan
      }  // akhir pencocokan pengguna
    }  // akhir loop pengguna
  }  // akhir loop role
  throw new Error("Role pengguna tidak ditemukan. Login dibatalkan.");  // tidak ada role yang cocok: login dibatalkan
}  // akhir roleDariServer

function mulaiLogin(): void {  // memasang logika submit pada form login
  const form = document.getElementById("loginForm") as HTMLFormElement;  // ambil elemen form login
  const username = document.getElementById("username") as HTMLInputElement;  // ambil input username
  const password = document.getElementById("password") as HTMLInputElement;  // ambil input password
  const tombol = document.getElementById("loginBtn") as HTMLButtonElement;  // ambil tombol masuk
  const pesan = document.getElementById("loginPesan") as HTMLParagraphElement;  // ambil elemen pesan error
  let memproses = false;  // penanda: true saat permintaan login sedang berjalan

  form.addEventListener("submit", async (event) => {  // saat form dikirim (handler async)
    event.preventDefault();  // cegah halaman reload bawaan form
    if (memproses) return;  // abaikan bila masih memproses (cegah kirim ganda)
    memproses = true;  // tandai mulai memproses
    tombol.disabled = true;  // kunci tombol selama permintaan
    tombol.textContent = "Memverifikasi...";  // ubah teks tombol sebagai indikator
    pesan.textContent = "";  // kosongkan pesan lama
    hapusSesi();  // bersihkan sesi lama sebelum login baru
    try {  // awal blok yang mungkin gagal
      const respons = await fetch("https://dummyjson.com/auth/login", {  // kirim permintaan login ke DummyJSON
        method: "POST",  // metode POST karena mengirim kredensial
        headers: { "Content-Type": "application/json" },  // beri tahu server bahwa isi permintaan berformat JSON
        body: JSON.stringify({  // ubah objek kredensial menjadi string JSON
          username: username.value.trim(),  // username tanpa spasi di tepi
          password: password.value  // password apa adanya (tidak di-trim)
        })  // akhir objek kredensial
      });  // akhir permintaan fetch
      if (!respons.ok) {  // bila server membalas status gagal
        if (respons.status === 400 || respons.status === 401) {  // 400/401 berarti kredensial salah
          throw new Error("Username atau password salah.");  // pesan kesalahan kredensial
        }  // akhir pengecekan status kredensial
        throw new Error("Server login bermasalah. Coba kembali.");  // status gagal lain: masalah di server
      }  // akhir pengecekan respons.ok
      const data = await respons.json() as ResponsLogin;  // ubah respons JSON menjadi objek ResponsLogin
      if (!data.accessToken || !data.firstName || !data.id || !data.username) {  // pastikan data penting lengkap
        throw new Error("Respons login tidak lengkap.");  // data kurang: login dianggap gagal
      }  // akhir validasi kelengkapan
      const role = await roleDariServer(data);  // tentukan role pengguna (dari respons atau server)
      localStorage.setItem("token", data.accessToken);  // simpan token (password tidak disimpan)
      localStorage.setItem("role", role);  // simpan role
      localStorage.setItem("firstName", data.firstName);  // simpan nama depan
      if (role === "admin" || role === "moderator") {  // admin/moderator
        window.location.href = "index.html";  // diarahkan ke dashboard
      } else {  // role user
        window.location.href = "operator.html";  // diarahkan ke halaman operator
      }  // akhir pengalihan menurut role
    } catch (error) {  // menangkap semua error di blok try
      hapusSesi();  // pastikan tidak ada sesi setengah jadi
      if (error instanceof TypeError) {  // fetch melempar TypeError saat jaringan gagal
        pesan.textContent = "Koneksi gagal. Periksa internet dan coba lagi.";  // pesan masalah koneksi
      } else if (error instanceof Error) {  // error biasa yang kita lempar sendiri
        pesan.textContent = error.message;  // tampilkan pesan error tersebut
      } else {  // jenis error tak dikenal
        pesan.textContent = "Login gagal.";  // pesan umum
      }  // akhir pemilihan pesan error
    } finally {  // selalu dijalankan, berhasil atau gagal
      memproses = false;  // izinkan kirim lagi
      tombol.disabled = false;  // buka kunci tombol
      tombol.textContent = "Masuk";  // kembalikan teks tombol
    }  // akhir try/catch/finally
  });  // akhir handler submit
}  // akhir mulaiLogin

mulaiLogin();  // jalankan pemasangan handler saat script dimuat
```

##### `operator.html`

```html
<!DOCTYPE html>  <!-- deklarasi dokumen HTML5 -->
<html lang="id">  <!-- elemen akar; bahasa Indonesia -->
<head>  <!-- awal metadata dan resource -->
  <meta charset="UTF-8">  <!-- encoding UTF-8 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- tampilan responsif -->
  <title>Operator - Antrian Rumah Sakit</title>  <!-- judul tab browser -->
  <link rel="stylesheet" href="style.css">  <!-- memuat stylesheet bersama -->
  <script src="dist/storage.js" defer></script>  <!-- fungsi penyimpanan/aturan antrean; dimuat dulu karena dipakai operator.js -->
  <script src="dist/auth.js" defer></script>  <!-- fungsi guard login dan navigasi -->
  <script src="dist/operator.js" defer></script>  <!-- logika halaman operator; terakhir karena bergantung dua script di atas -->
</head>  <!-- akhir head -->
<body>  <!-- awal isi halaman -->
  <div class="container">  <!-- pembungkus utama berlebar maksimum -->
    <div class="navbar">  <!-- bilah navigasi -->
      <strong>Panel operator</strong>  <!-- nama halaman -->
      <span id="identitas"></span>  <!-- diisi "nama | role" oleh pasangNavigasi -->
      <a href="index.html">Dashboard admin</a>  <!-- tautan ke dashboard -->
      <a href="ambil-antrian.html">Ambil antrean</a>  <!-- tautan ke halaman ambil antrean -->
      <a href="layar.html">Layar antrean</a>  <!-- tautan ke layar antrean -->
      <button id="logoutBtn" type="button">Logout</button>  <!-- tombol keluar; handler dipasang pasangNavigasi -->
    </div>  <!-- akhir navbar -->
    <h1>Panggil antrean</h1>  <!-- judul halaman -->
    <p>Kelompok prioritas dipanggil lebih dahulu; sesama kelompok mengikuti urutan tiket.</p>  <!-- keterangan aturan pemanggilan -->
    <p id="operatorPesan" class="pesan"></p>  <!-- tempat pesan status/error operator -->
    <div id="operatorKartu" class="grid"></div>  <!-- wadah kartu layanan yang dibuat oleh operator.ts -->
  </div>  <!-- akhir container -->
</body>  <!-- akhir isi halaman -->
</html>  <!-- akhir dokumen -->
```

##### `src/operator.ts`

```ts
function ubahAntrian(kode: string, aksi: "panggil" | "selesai" | "lewati"): void {  // mengubah status tiket pada satu layanan menurut aksi operator
  const data = bacaTiket();  // baca semua tiket terbaru dari Local Storage
  const sekarang = tiketDipanggil(kode, data);  // tiket layanan ini yang sedang dipanggil (atau null)
  if (aksi === "panggil") {  // aksi "Panggil berikutnya"
    if (sekarang !== null) sekarang.status = "Selesai";  // tiket yang sedang dipanggil dianggap selesai
    const berikut = tiketBerikutnya(kode, data);  // pilih tiket menunggu berikutnya (prioritas dulu)
    if (berikut !== null) berikut.status = "Dipanggil";  // tandai tiket itu sebagai sedang dipanggil
  } else if (aksi === "selesai") {  // aksi "Selesai"
    if (sekarang !== null) sekarang.status = "Selesai";  // selesaikan tiket tanpa memanggil yang lain
  } else {  // aksi "Lewati"
    if (sekarang !== null) sekarang.status = "Dilewati";  // tiket ditandai dilewati
  }  // akhir pemilihan aksi
  simpanTiket(data);  // simpan perubahan kembali ke Local Storage
}  // akhir ubahAntrian

function mulaiOperator(): void {  // menyiapkan halaman operator
  if (!cekLogin(false)) return;  // wajib login; bila tidak, berhenti (sudah dialihkan ke login)
  pasangNavigasi();  // tampilkan identitas dan pasang tombol logout
  const wadah = document.getElementById("operatorKartu") as HTMLDivElement;  // wadah kartu layanan
  const pesan = document.getElementById("operatorPesan") as HTMLParagraphElement;  // elemen pesan status

  function renderOperator(): void {  // menggambar ulang semua kartu layanan
    if (!cekLogin(false)) return;  // cek sesi lagi setiap render (mis. setelah logout di tab lain)
    const jenisData = bacaJenis();  // baca daftar layanan
    const tiketData = bacaTiket();  // baca daftar tiket
    wadah.innerHTML = "";  // kosongkan tampilan lama
    if (jenisData.length === 0) {  // belum ada layanan sama sekali
      wadah.textContent = "Belum ada layanan. Admin perlu menambah layanan.";  // tampilkan petunjuk
      return;  // tidak ada kartu yang perlu dibuat
    }  // akhir pengecekan layanan kosong
    for (const jenis of jenisData) {  // buat satu kartu untuk setiap layanan
      const kartu = document.createElement("div");  // elemen kartu
      kartu.className = "card";  // beri gaya kartu
      const judul = document.createElement("h2");  // judul kartu
      judul.textContent = jenis.kode + " - " + jenis.nama;  // isi "kode - nama" (textContent aman dari injeksi HTML)
      const status = document.createElement("p");  // baris status layanan
      status.textContent = jenis.aktif ? "Layanan aktif" : "Nonaktif untuk tiket baru";  // teks sesuai status aktif
      const sekarang = tiketDipanggil(jenis.kode, tiketData);  // tiket yang sedang dipanggil
      const berikut = tiketBerikutnya(jenis.kode, tiketData);  // tiket berikutnya yang akan dipanggil
      const nomor = document.createElement("p");  // elemen nomor besar
      nomor.className = "nomor";  // gaya nomor besar
      nomor.textContent = sekarang === null ? "-" : sekarang.label;  // tampilkan label tiket atau "-"
      const detail = document.createElement("p");  // baris detail prioritas
      detail.textContent = "Sedang dipanggil: " +  // awal teks detail
        (sekarang === null ? "Tidak ada" : sekarang.prioritas);  // prioritas tiket atau "Tidak ada"
      const selanjutnya = document.createElement("p");  // baris tiket berikutnya
      selanjutnya.textContent = "Berikutnya: " + (berikut === null ? "-" :  // awal teks; "-" bila tidak ada
        berikut.label + " (" + berikut.prioritas + ")");  // label dan prioritas tiket berikutnya
      const sisa = document.createElement("p");  // baris jumlah menunggu
      sisa.textContent = "Menunggu: " + jumlahMenunggu(jenis.kode, tiketData);  // jumlah tiket berstatus Menunggu
      const tombolWadah = document.createElement("div");  // wadah tombol aksi
      tombolWadah.className = "aksi";  // gaya baris tombol

      function tombolOperator(teks: string, aksi: "panggil" | "selesai" | "lewati",  // pembuat tombol aksi: teks, jenis aksi,
          nonaktif: boolean): HTMLButtonElement {  // dan apakah tombol dinonaktifkan
        const tombol = document.createElement("button");  // elemen tombol
        tombol.type = "button";  // bukan tombol submit
        tombol.textContent = teks;  // teks tombol
        tombol.disabled = nonaktif;  // nonaktifkan bila aksi tidak mungkin dilakukan
        tombol.addEventListener("click", () => {  // saat tombol diklik
          if (!cekLogin(false)) return;  // pastikan sesi masih valid
          try {  // awal blok yang mungkin error
            ubahAntrian(jenis.kode, aksi);  // jalankan aksi pada layanan ini
            pesan.textContent = "Antrean " + jenis.kode + " diperbarui.";  // beri umpan balik
            renderOperator();  // gambar ulang agar tampilan terbaru
          } catch (error) { pesan.textContent = pesanError(error); }  // tampilkan pesan bila gagal
        });  // akhir handler klik
        return tombol;  // kembalikan tombol yang sudah jadi
      }  // akhir tombolOperator

      tombolWadah.appendChild(tombolOperator("Panggil berikutnya", "panggil", berikut === null));  // tombol panggil; nonaktif bila tak ada tiket berikutnya
      tombolWadah.appendChild(tombolOperator("Selesai", "selesai", sekarang === null));  // tombol selesai; nonaktif bila tak ada tiket dipanggil
      tombolWadah.appendChild(tombolOperator("Lewati", "lewati", sekarang === null));  // tombol lewati; nonaktif bila tak ada tiket dipanggil
      kartu.appendChild(judul);  // pasang judul ke kartu
      kartu.appendChild(status);  // pasang status layanan
      kartu.appendChild(nomor);  // pasang nomor besar
      kartu.appendChild(detail);  // pasang detail prioritas
      kartu.appendChild(selanjutnya);  // pasang info berikutnya
      kartu.appendChild(sisa);  // pasang jumlah menunggu
      kartu.appendChild(tombolWadah);  // pasang tombol aksi
      wadah.appendChild(kartu);  // pasang kartu ke halaman
    }  // akhir loop layanan
  }  // akhir renderOperator

  function perbaruiOperator(): void {  // membungkus render dengan penanganan error
    try { renderOperator(); }  // coba gambar ulang tampilan
    catch (error) { pesan.textContent = pesanError(error); }  // bila gagal, tampilkan pesan
  }  // akhir perbaruiOperator
  perbaruiOperator();  // gambar tampilan pertama kali
  setInterval(perbaruiOperator, 3000);  // segarkan tiap 3 detik agar perubahan dari tab lain terlihat
}  // akhir mulaiOperator

mulaiOperator();  // jalankan halaman operator saat script dimuat
```

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

#### Kode lengkap dan penjelasan per baris

Komentar di samping tiap baris hanya ditulis di README ini; file kode aslinya tidak diubah.

##### `src/storage.ts`

```ts
function bacaJenis(): JenisAntrian[] {  // membaca daftar layanan dari Local Storage
  const teks = localStorage.getItem("jenisAntrian");  // ambil string JSON (null bila belum ada)
  if (teks === null) return [];  // belum ada data: kembalikan array kosong
  return JSON.parse(teks) as JenisAntrian[];  // ubah string JSON menjadi array layanan
}  // akhir bacaJenis

function simpanJenis(data: JenisAntrian[]): void {  // menyimpan daftar layanan ke Local Storage
  localStorage.setItem("jenisAntrian", JSON.stringify(data));  // ubah array menjadi string JSON lalu simpan
}  // akhir simpanJenis

function bacaTiket(): TiketAntrian[] {  // membaca daftar tiket dari Local Storage
  const teks = localStorage.getItem("tiketAntrian");  // ambil string JSON (null bila belum ada)
  if (teks === null) return [];  // belum ada tiket: kembalikan array kosong
  return JSON.parse(teks) as TiketAntrian[];  // ubah string JSON menjadi array tiket
}  // akhir bacaTiket

function simpanTiket(data: TiketAntrian[]): void {  // menyimpan daftar tiket ke Local Storage
  localStorage.setItem("tiketAntrian", JSON.stringify(data));  // ubah array menjadi string JSON lalu simpan
}  // akhir simpanTiket

function cariJenis(kode: string): JenisAntrian | null {  // mencari satu layanan berdasarkan kode
  for (const jenis of bacaJenis()) {  // telusuri semua layanan
    if (jenis.kode === kode) return jenis;  // ketemu: kembalikan layanan itu
  }  // akhir loop
  return null;  // tidak ditemukan
}  // akhir cariJenis

function prioritasValid(teks: string): teks is PrioritasTiket {  // type guard: cek teks adalah prioritas yang diperbolehkan
  return teks === "Normal" || teks === "Lansia" ||  // true bila salah satu dari Normal/Lansia,
    teks === "Disabilitas" || teks === "VIP";  // Disabilitas, atau VIP
}  // akhir prioritasValid

function formatNomor(kode: string, nomor: number): string {  // membuat label nomor, misalnya "A-001"
  let angka = String(nomor);  // ubah nomor menjadi teks
  if (nomor < 10) angka = "00" + angka;  // satu digit: tambah dua nol di depan
  else if (nomor < 100) angka = "0" + angka;  // dua digit: tambah satu nol di depan
  return kode + "-" + angka;  // gabungkan kode, tanda hubung, dan nomor tiga digit
}  // akhir formatNomor

function buatTiket(kode: string, prioritas: PrioritasTiket): TiketAntrian {  // menerbitkan tiket baru (dipakai dashboard dan halaman ambil antrean)
  // Selalu baca ulang data terbaru sebelum mengubahnya.
  const semuaJenis = bacaJenis();  // ambil daftar layanan terbaru
  let layanan: JenisAntrian | null = null;  // tempat menyimpan layanan yang dipilih

  for (const jenis of semuaJenis) {  // telusuri semua layanan
    if (jenis.kode === kode) layanan = jenis;  // simpan referensi layanan dengan kode yang cocok
  }  // akhir loop

  if (layanan === null || !layanan.aktif) {  // layanan tidak ada atau sedang nonaktif
    throw new Error("Layanan tidak tersedia atau sedang nonaktif.");  // tolak penerbitan tiket
  }  // akhir validasi layanan

  if (!prioritasValid(prioritas)) {  // prioritas di luar daftar yang diizinkan
    throw new Error("Prioritas tidak valid.");  // tolak penerbitan tiket
  }  // akhir validasi prioritas

  if (layanan.nomorTerakhir >= 999) {  // nomor sudah di batas tiga digit
    throw new Error("Nomor sudah mencapai 999. Hubungi admin untuk reset.");  // tolak; perlu reset oleh admin
  }  // akhir validasi batas nomor

  const nomor = layanan.nomorTerakhir + 1;  // nomor baru = nomor terakhir + 1 (bukan jumlah tiket menunggu)

  const tiket: TiketAntrian = {  // susun objek tiket baru
    kodeJenis: kode,  // kode layanan pemilik tiket
    nomor: nomor,  // nomor urut tiket
    label: formatNomor(kode, nomor),  // label tampilan, mis. "A-001"
    prioritas: prioritas,  // prioritas yang dipilih
    status: "Menunggu"  // status awal setiap tiket baru
  };  // akhir objek tiket

  const semuaTiket = bacaTiket();  // ambil daftar tiket terbaru
  semuaTiket.push(tiket);  // tambahkan tiket baru di akhir (urutan = urutan terbit)

  layanan.nomorTerakhir = nomor;  // perbarui penghitung nomor pada layanan

  simpanJenis(semuaJenis);  // simpan layanan dengan nomorTerakhir baru
  simpanTiket(semuaTiket);  // simpan daftar tiket yang sudah bertambah

  return tiket;  // kembalikan tiket agar bisa ditampilkan pemanggil
}  // akhir buatTiket

function tiketDipanggil(  // mencari tiket yang sedang dipanggil pada satu layanan
  kode: string,  // kode layanan yang dicari
  data: TiketAntrian[]  // daftar tiket yang diperiksa
): TiketAntrian | null {  // hasil: tiket atau null
  for (const tiket of data) {  // telusuri semua tiket
    if (  // awal kondisi
      tiket.kodeJenis === kode &&  // tiket milik layanan ini
      tiket.status === "Dipanggil"  // dan statusnya sedang dipanggil
    ) {  // akhir kondisi
      return tiket;  // ketemu: kembalikan tiket
    }  // akhir if
  }  // akhir loop

  return null;  // tidak ada tiket yang sedang dipanggil
}  // akhir tiketDipanggil

function tiketBerikutnya(  // memilih tiket menunggu yang akan dipanggil berikutnya
  kode: string,  // kode layanan
  data: TiketAntrian[]  // daftar tiket yang diperiksa
): TiketAntrian | null {  // hasil: tiket atau null
  let normalPertama: TiketAntrian | null = null;  // menyimpan tiket Normal paling awal sebagai cadangan

  for (const tiket of data) {  // telusuri tiket sesuai urutan terbit
    if (  // awal kondisi lewati
      tiket.kodeJenis !== kode ||  // abaikan tiket layanan lain
      tiket.status !== "Menunggu"  // abaikan tiket yang tidak berstatus Menunggu
    ) {  // akhir kondisi
      continue;  // lanjut ke tiket berikutnya
    }  // akhir if

    // Array tersimpan sesuai urutan penerbitan tiket.
    if (tiket.prioritas !== "Normal") {  // prioritas non-Normal (Lansia/Disabilitas/VIP)
      return tiket;  // langsung pilih yang paling awal terbit; semua non-Normal satu kelompok
    }  // akhir if prioritas

    if (normalPertama === null) {  // tiket Normal pertama yang ditemui
      normalPertama = tiket;  // simpan sebagai cadangan
    }  // akhir if
  }  // akhir loop

  return normalPertama;  // tidak ada prioritas: pakai Normal paling awal (atau null)
}  // akhir tiketBerikutnya

function jumlahMenunggu(  // menghitung tiket berstatus Menunggu pada satu layanan
  kode: string,  // kode layanan
  data: TiketAntrian[]  // daftar tiket yang diperiksa
): number {  // hasil: jumlah tiket
  let jumlah = 0;  // penghitung awal nol

  for (const tiket of data) {  // telusuri semua tiket
    if (  // awal kondisi hitung
      tiket.kodeJenis === kode &&  // tiket milik layanan ini
      tiket.status === "Menunggu"  // dan masih menunggu
    ) {  // akhir kondisi
      jumlah++;  // tambah satu
    }  // akhir if
  }  // akhir loop

  return jumlah;  // kembalikan total
}  // akhir jumlahMenunggu

function isiPilihanJenis(select: HTMLSelectElement): void {  // mengisi dropdown dengan layanan aktif
  const pilihanLama = select.value;  // ingat pilihan saat ini sebelum dikosongkan

  select.innerHTML = "";  // hapus semua opsi lama

  const awal = document.createElement("option");  // opsi pertama (petunjuk)
  awal.value = "";  // nilai kosong = belum memilih
  awal.textContent = "Pilih layanan";  // teks petunjuk
  select.appendChild(awal);  // pasang opsi petunjuk

  for (const jenis of bacaJenis()) {  // telusuri semua layanan
    if (!jenis.aktif) continue;  // lewati layanan nonaktif

    const pilihan = document.createElement("option");  // opsi untuk layanan ini
    pilihan.value = jenis.kode;  // nilai opsi = kode layanan
    pilihan.textContent = jenis.kode + " - " + jenis.nama;  // teks opsi "kode - nama"

    select.appendChild(pilihan);  // pasang opsi ke dropdown
  }  // akhir loop

  // Pertahankan pilihan jika layanan itu masih aktif.
  const lama = cariJenis(pilihanLama);  // cari layanan dari pilihan lama

  if (lama !== null && lama.aktif) {  // layanan itu masih ada dan aktif
    select.value = pilihanLama;  // kembalikan pilihan semula
  }  // akhir if
}  // akhir isiPilihanJenis

function pesanError(error: unknown): string {  // mengubah error menjadi teks pesan untuk ditampilkan
  if (error instanceof Error) {  // bila objek Error standar
    return error.message;  // pakai pesan aslinya
  }  // akhir if

  return "Terjadi kesalahan. Periksa Console browser.";  // pesan umum untuk jenis error lain
}  // akhir pesanError
```

##### `index.html`

```html
<!DOCTYPE html>  <!-- deklarasi dokumen HTML5 -->
<html lang="id">  <!-- elemen akar; bahasa Indonesia -->
<head>  <!-- awal metadata dan resource -->
  <meta charset="UTF-8">  <!-- encoding UTF-8 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- tampilan responsif -->
  <title>Dashboard Admin - Antrian Rumah Sakit</title>  <!-- judul tab browser -->
  <link rel="stylesheet" href="style.css">  <!-- memuat stylesheet bersama -->
  <script src="dist/storage.js" defer></script>  <!-- fungsi penyimpanan dan aturan antrean -->
  <script src="dist/auth.js" defer></script>  <!-- fungsi guard login dan navigasi -->
  <script src="dist/admin.js" defer></script>  <!-- logika dashboard; dimuat terakhir karena memakai dua script di atas -->
</head>  <!-- akhir head -->
<body>  <!-- awal isi halaman -->
  <div class="container">  <!-- pembungkus utama -->
    <div class="navbar">  <!-- bilah navigasi -->
      <strong>Dashboard admin</strong>  <!-- nama halaman -->
      <span id="identitas"></span>  <!-- diisi "nama | role" oleh pasangNavigasi -->
      <a href="operator.html">Operator</a>  <!-- tautan ke halaman operator -->
      <a href="ambil-antrian.html">Ambil antrean</a>  <!-- tautan ke halaman ambil antrean -->
      <a href="layar.html">Layar antrean</a>  <!-- tautan ke layar antrean -->
      <button id="logoutBtn" type="button">Logout</button>  <!-- tombol keluar -->
    </div>  <!-- akhir navbar -->

    <h1>Manajemen antrean</h1>  <!-- judul halaman -->

    <div class="grid">  <!-- grid dua kolom untuk dua kartu form -->

      <div class="card">  <!-- kartu form tambah layanan -->
        <h2>Tambah layanan</h2>  <!-- judul kartu -->

        <form id="jenisForm">  <!-- form tambah layanan; id dipakai admin.ts -->
          <label for="kodeJenis">Kode, satu huruf A-Z</label>  <!-- label input kode -->
          <input id="kodeJenis" type="text" maxlength="1" required>  <!-- isian kode, maksimal satu karakter, wajib -->

          <label for="namaJenis">Nama layanan</label>  <!-- label input nama -->
          <input id="namaJenis" type="text" required>  <!-- isian nama layanan, wajib -->

          <button type="submit">Tambah layanan</button>  <!-- tombol kirim form -->
        </form>  <!-- akhir form tambah layanan -->
      </div>  <!-- akhir kartu tambah layanan -->

      <div class="card">  <!-- kartu form tiket manual -->
        <h2>Tiket manual</h2>  <!-- judul kartu -->

        <form id="manualForm">  <!-- form tiket manual -->
          <label for="manualJenis">Layanan aktif</label>  <!-- label dropdown layanan -->
          <select id="manualJenis" required></select>  <!-- dropdown layanan aktif, diisi isiPilihanJenis -->

          <label for="manualPrioritas">Prioritas</label>  <!-- label dropdown prioritas -->
          <select id="manualPrioritas">  <!-- dropdown prioritas -->
            <option value="Normal">Normal</option>  <!-- pilihan prioritas Normal -->
            <option value="Lansia">Lansia</option>  <!-- pilihan prioritas Lansia -->
            <option value="Disabilitas">Disabilitas</option>  <!-- pilihan prioritas Disabilitas -->
            <option value="VIP">VIP</option>  <!-- pilihan prioritas VIP -->
          </select>  <!-- akhir dropdown prioritas -->

          <button type="submit">Terbitkan tiket</button>  <!-- tombol kirim form -->
        </form>  <!-- akhir form tiket manual -->

        <p id="tiketManual" class="nomor"></p>  <!-- menampilkan nomor tiket yang baru terbit -->
      </div>  <!-- akhir kartu tiket manual -->

    </div>  <!-- akhir grid -->

    <p id="adminPesan" class="pesan"></p>  <!-- tempat pesan sukses/error dashboard -->

    <div class="card">  <!-- kartu daftar layanan -->
      <h2>Daftar layanan</h2>  <!-- judul kartu -->

      <div class="table-wrap">  <!-- pembungkus agar tabel bisa digeser horizontal -->
        <table>  <!-- tabel layanan -->
          <thead>  <!-- kepala tabel -->
            <tr>  <!-- baris judul kolom -->
              <th>Kode</th>  <!-- kolom kode -->
              <th>Nama</th>  <!-- kolom nama (dapat diedit) -->
              <th>Status</th>  <!-- kolom status aktif/nonaktif -->
              <th>Aksi</th>  <!-- kolom tombol aksi -->
            </tr>  <!-- akhir baris judul -->
          </thead>  <!-- akhir kepala tabel -->

          <tbody id="jenisBody"></tbody>  <!-- isi tabel; baris dibuat oleh admin.ts -->
        </table>  <!-- akhir tabel -->
      </div>  <!-- akhir table-wrap -->

      <button id="resetBtn" class="bahaya" type="button">  <!-- tombol reset berwarna merah (bahaya) -->
        Reset semua antrean  <!-- teks tombol reset -->
      </button>  <!-- akhir tombol reset -->
    </div>  <!-- akhir kartu daftar layanan -->

  </div>  <!-- akhir container -->
</body>  <!-- akhir isi halaman -->
</html>  <!-- akhir dokumen -->
```

##### `src/admin.ts`

```ts
function namaSudahAda(nama: string, kecualiKode: string): boolean {  // cek apakah nama layanan sudah dipakai layanan lain
  for (const jenis of bacaJenis()) {  // telusuri semua layanan
    if (jenis.kode !== kecualiKode &&  // abaikan layanan yang sedang diedit (kode yang dikecualikan)
        jenis.nama.toLowerCase() === nama.toLowerCase()) return true;  // nama sama tanpa membedakan kapitalisasi: sudah ada
  }  // akhir loop
  return false;  // tidak ada yang sama
}  // akhir namaSudahAda

function mulaiAdmin(): void {  // menyiapkan seluruh fungsi dashboard
  if (!cekLogin(true)) return;  // hanya admin/moderator; selain itu berhenti dan dialihkan
  pasangNavigasi();  // tampilkan identitas dan pasang tombol logout

  const form = document.getElementById("jenisForm") as HTMLFormElement;  // form tambah layanan
  const kodeInput = document.getElementById("kodeJenis") as HTMLInputElement;  // input kode layanan
  const namaInput = document.getElementById("namaJenis") as HTMLInputElement;  // input nama layanan
  const body = document.getElementById("jenisBody") as HTMLTableSectionElement;  // isi tabel daftar layanan
  const pesan = document.getElementById("adminPesan") as HTMLParagraphElement;  // elemen pesan sukses/error
  const manual = document.getElementById("manualForm") as HTMLFormElement;  // form tiket manual
  const manualJenis = document.getElementById("manualJenis") as HTMLSelectElement;  // dropdown layanan tiket manual
  const manualPrioritas = document.getElementById("manualPrioritas") as HTMLSelectElement;  // dropdown prioritas tiket manual
  const hasil = document.getElementById("tiketManual") as HTMLParagraphElement;  // tempat menampilkan tiket yang terbit
  const reset = document.getElementById("resetBtn") as HTMLButtonElement;  // tombol reset antrean

  function renderAdmin(): void {  // menggambar ulang tabel layanan
    body.innerHTML = "";  // kosongkan isi tabel lama

    for (const jenis of bacaJenis()) {  // satu baris tabel untuk setiap layanan
      const baris = document.createElement("tr");  // elemen baris

      const selKode = document.createElement("td");  // sel kode
      selKode.textContent = jenis.kode;  // isi kode layanan

      const selNama = document.createElement("td");  // sel nama
      const editNama = document.createElement("input");  // input untuk mengedit nama
      editNama.type = "text";  // jenis input teks
      editNama.value = jenis.nama;  // isi nilai awal dengan nama sekarang (aman dari injeksi HTML)
      editNama.setAttribute("aria-label", "Nama layanan " + jenis.kode);  // label aksesibilitas untuk pembaca layar
      selNama.appendChild(editNama);  // pasang input ke sel nama

      const selStatus = document.createElement("td");  // sel status
      selStatus.textContent = jenis.aktif ? "Aktif" : "Nonaktif";  // teks sesuai status aktif

      const selAksi = document.createElement("td");  // sel tombol aksi

      const simpan = document.createElement("button");  // tombol simpan nama
      simpan.type = "button";  // bukan tombol submit
      simpan.textContent = "Simpan nama";  // teks tombol

      simpan.addEventListener("click", () => {  // saat tombol simpan diklik
        if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

        try {  // awal blok yang mungkin error
          const namaBaru = editNama.value.trim();  // nama baru tanpa spasi di tepi

          if (namaBaru === "") {  // nama kosong
            throw new Error("Nama tidak boleh kosong.");  // tolak
          }  // akhir cek kosong

          if (namaSudahAda(namaBaru, jenis.kode)) {  // nama dipakai layanan lain
            throw new Error("Nama layanan sudah digunakan.");  // tolak
          }  // akhir cek duplikat

          const data = bacaJenis();  // baca data layanan terbaru

          for (const item of data) {  // telusuri layanan
            if (item.kode === jenis.kode) {  // layanan yang dimaksud
              item.nama = namaBaru;  // ganti nama (kode tetap, tiket lama tetap terhubung)
            }  // akhir if
          }  // akhir loop

          simpanJenis(data);  // simpan perubahan
          pesan.textContent = "Nama layanan diperbarui.";  // pesan sukses
          renderAdmin();  // gambar ulang tabel

        } catch (error) {  // bila terjadi error
          pesan.textContent = pesanError(error);  // tampilkan pesan error
        }  // akhir try/catch
      });  // akhir handler simpan

      const toggle = document.createElement("button");  // tombol aktif/nonaktif
      toggle.type = "button";  // bukan tombol submit
      toggle.textContent = jenis.aktif ? "Nonaktifkan" : "Aktifkan";  // teks sesuai status saat ini

      toggle.addEventListener("click", () => {  // saat tombol toggle diklik
        if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

        try {  // awal blok yang mungkin error
          const data = bacaJenis();  // baca data layanan terbaru

          for (const item of data) {  // telusuri layanan
            if (item.kode === jenis.kode) {  // layanan yang dimaksud
              item.aktif = !item.aktif;  // balik status aktif <-> nonaktif
            }  // akhir if
          }  // akhir loop

          simpanJenis(data);  // simpan perubahan
          pesan.textContent = "Status layanan diperbarui.";  // pesan sukses
          renderAdmin();  // gambar ulang tabel

        } catch (error) {  // bila terjadi error
          pesan.textContent = pesanError(error);  // tampilkan pesan error
        }  // akhir try/catch
      });  // akhir handler toggle

      const hapus = document.createElement("button");  // tombol hapus layanan
      hapus.type = "button";  // bukan tombol submit
      hapus.className = "bahaya";  // gaya tombol merah
      hapus.textContent = "Hapus";  // teks tombol

      hapus.addEventListener("click", () => {  // saat tombol hapus diklik
        if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

        if (  // awal kondisi konfirmasi
          !confirm(  // tampilkan dialog konfirmasi; hasil false bila dibatalkan
            "Hapus layanan " +  // awal teks konfirmasi
            jenis.kode +  // sebut kode layanan
            " beserta seluruh tiketnya?"  // peringatan tiket ikut terhapus
          )  // akhir confirm
        ) return;  // dibatalkan: hentikan tanpa menghapus

        try {  // awal blok yang mungkin error
          const sisaJenis: JenisAntrian[] = [];  // layanan yang tersisa setelah penghapusan
          const sisaTiket: TiketAntrian[] = [];  // tiket yang tersisa setelah penghapusan

          for (const item of bacaJenis()) {  // telusuri semua layanan
            if (item.kode !== jenis.kode) {  // selain layanan yang dihapus
              sisaJenis.push(item);  // pertahankan
            }  // akhir if
          }  // akhir loop layanan

          for (const tiket of bacaTiket()) {  // telusuri semua tiket
            if (tiket.kodeJenis !== jenis.kode) {  // selain tiket layanan yang dihapus
              sisaTiket.push(tiket);  // pertahankan
            }  // akhir if
          }  // akhir loop tiket

          simpanJenis(sisaJenis);  // simpan daftar layanan baru
          simpanTiket(sisaTiket);  // simpan daftar tiket baru

          hasil.textContent = "";  // kosongkan tampilan tiket manual terakhir
          pesan.textContent = "Layanan dan tiketnya dihapus.";  // pesan sukses
          renderAdmin();  // gambar ulang tabel

        } catch (error) {  // bila terjadi error
          pesan.textContent = pesanError(error);  // tampilkan pesan error
        }  // akhir try/catch
      });  // akhir handler hapus

      selAksi.appendChild(simpan);  // pasang tombol simpan ke sel aksi
      selAksi.appendChild(toggle);  // pasang tombol toggle
      selAksi.appendChild(hapus);  // pasang tombol hapus

      baris.appendChild(selKode);  // pasang sel kode ke baris
      baris.appendChild(selNama);  // pasang sel nama
      baris.appendChild(selStatus);  // pasang sel status
      baris.appendChild(selAksi);  // pasang sel aksi

      body.appendChild(baris);  // pasang baris ke tabel
    }  // akhir loop layanan

    isiPilihanJenis(manualJenis);  // segarkan dropdown tiket manual dengan layanan aktif
  }  // akhir renderAdmin

  form.addEventListener("submit", (event) => {  // saat form tambah layanan dikirim
    event.preventDefault();  // cegah reload halaman

    if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

    try {  // awal blok yang mungkin error
      const kode = kodeInput.value.trim().toUpperCase();  // kode: pangkas spasi dan jadikan huruf kapital
      const nama = namaInput.value.trim();  // nama: pangkas spasi di tepi

      if (  // awal validasi kode
        kode.length !== 1 ||  // kode harus tepat satu karakter
        !"ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(kode)  // dan karakternya harus huruf A-Z
      ) {  // akhir kondisi
        throw new Error("Kode harus satu huruf A-Z.");  // tolak kode tidak valid
      }  // akhir validasi kode

      if (nama === "") {  // nama kosong
        throw new Error("Nama layanan tidak boleh kosong.");  // tolak
      }  // akhir validasi nama

      if (cariJenis(kode) !== null || namaSudahAda(nama, "")) {  // kode atau nama sudah dipakai
        throw new Error("Kode atau nama layanan sudah digunakan.");  // tolak duplikat
      }  // akhir validasi duplikat

      const data = bacaJenis();  // baca data layanan terbaru

      data.push({  // tambahkan layanan baru
        kode: kode,  // kode yang sudah dinormalkan
        nama: nama,  // nama yang sudah dipangkas
        aktif: true,  // layanan baru langsung aktif
        nomorTerakhir: 0  // penghitung nomor mulai dari nol
      });  // akhir objek layanan baru

      simpanJenis(data);  // simpan daftar layanan

      form.reset();  // kosongkan isian form

      pesan.textContent = "Layanan berhasil ditambahkan.";  // pesan sukses
      renderAdmin();  // gambar ulang tabel

    } catch (error) {  // bila terjadi error
      pesan.textContent = pesanError(error);  // tampilkan pesan error
    }  // akhir try/catch
  });  // akhir handler tambah layanan

  manual.addEventListener("submit", (event) => {  // saat form tiket manual dikirim
    event.preventDefault();  // cegah reload halaman

    if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

    try {  // awal blok yang mungkin error
      const prioritas = manualPrioritas.value;  // ambil prioritas yang dipilih (masih bertipe string)

      if (!prioritasValid(prioritas)) {  // pastikan termasuk prioritas yang diizinkan
        throw new Error("Prioritas tidak valid.");  // tolak
      }  // akhir validasi prioritas

      const tiket = buatTiket(  // terbitkan tiket lewat fungsi bersama
        manualJenis.value,  // kode layanan yang dipilih
        prioritas  // prioritas yang sudah divalidasi
      );  // akhir pemanggilan buatTiket

      hasil.textContent =  // tampilkan tiket yang terbit
        tiket.label + " | " + tiket.prioritas;  // format "label | prioritas"

      pesan.textContent =  // pesan sukses
        "Tiket manual langsung masuk antrean.";  // tiket berstatus Menunggu

    } catch (error) {  // bila terjadi error (mis. layanan nonaktif)
      pesan.textContent = pesanError(error);  // tampilkan pesan error
    }  // akhir try/catch
  });  // akhir handler tiket manual

  reset.addEventListener("click", () => {  // saat tombol reset diklik
    if (!cekLogin(true)) return;  // pastikan sesi admin masih valid

    if (  // awal kondisi konfirmasi
      !confirm(  // tampilkan dialog konfirmasi
        "Kosongkan semua tiket dan mulai nomor dari 001?"  // teks peringatan reset
      )  // akhir confirm
    ) return;  // dibatalkan: hentikan

    try {  // awal blok yang mungkin error
      const data = bacaJenis();  // baca data layanan

      for (const jenis of data) {  // telusuri semua layanan
        jenis.nomorTerakhir = 0;  // ulang penghitung nomor ke nol
      }  // akhir loop

      simpanJenis(data);  // simpan layanan (master layanan tidak dihapus)
      simpanTiket([]);  // kosongkan semua tiket

      hasil.textContent = "";  // kosongkan tampilan tiket manual terakhir

      pesan.textContent =  // pesan sukses
        "Seluruh antrean direset. Tiket berikutnya mulai 001.";  // beri tahu nomor mulai dari 001

      renderAdmin();  // gambar ulang tabel

    } catch (error) {  // bila terjadi error
      pesan.textContent = pesanError(error);  // tampilkan pesan error
    }  // akhir try/catch
  });  // akhir handler reset

  try {  // render pertama kali saat halaman dibuka
    renderAdmin();  // gambar tabel layanan awal
  } catch (error) {  // bila gagal membaca data
    pesan.textContent = pesanError(error);  // tampilkan pesan error
  }  // akhir try/catch
}  // akhir mulaiAdmin

mulaiAdmin();  // jalankan dashboard saat script dimuat
```

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

#### Kode lengkap dan penjelasan per baris

Komentar di samping tiap baris hanya ditulis di README ini; file kode aslinya tidak diubah.

##### `style.css`

```css
* {  /* selector semua elemen */
  box-sizing: border-box;  /* padding dan border dihitung di dalam lebar elemen */
}  /* akhir aturan * */

body {  /* aturan untuk seluruh halaman */
  margin: 0;  /* hapus margin bawaan browser */
  font-family: Arial, sans-serif;  /* font utama Arial, cadangan sans-serif */
  background-color: #f1f5f9;  /* latar abu kebiruan muda */
  color: #17324d;  /* warna teks biru tua */
}  /* akhir aturan body */

.container {  /* pembungkus utama halaman */
  width: 92%;  /* lebar 92% dari layar */
  max-width: 1100px;  /* batas lebar maksimum di layar besar */
  margin: 24px auto;  /* jarak atas-bawah 24px, kiri-kanan otomatis (tengah) */
}  /* akhir aturan .container */

.navbar {  /* bilah navigasi */
  display: flex;  /* susun isi sejajar dalam satu baris */
  align-items: center;  /* sejajarkan isi di tengah secara vertikal */
  flex-wrap: wrap;  /* boleh turun baris bila sempit */
  gap: 12px;  /* jarak antar item */
  background-color: #ffffff;  /* latar putih */
  padding: 16px;  /* ruang di dalam navbar */
  border: 1px solid #cbd5e1;  /* garis tepi abu muda */
  border-radius: 8px;  /* sudut membulat */
}  /* akhir aturan .navbar */

a {  /* tautan */
  color: #075985;  /* warna biru tua */
  display: inline-block;  /* agar margin berlaku penuh */
  margin: 4px;  /* jarak di sekitar tautan */
}  /* akhir aturan a */

.grid {  /* tata letak grid kartu */
  display: grid;  /* aktifkan CSS Grid */
  grid-template-columns: repeat(2, 1fr);  /* dua kolom berukuran sama */
  gap: 18px;  /* jarak antar kartu */
  margin: 18px 0;  /* jarak atas-bawah grid */
}  /* akhir aturan .grid */

.card, .login-box {  /* gaya kartu dan kotak login */
  background-color: #ffffff;  /* latar putih */
  padding: 24px;  /* ruang di dalam kartu */
  border: 1px solid #cbd5e1;  /* garis tepi abu muda */
  border-radius: 10px;  /* sudut membulat */
}  /* akhir aturan .card, .login-box */

.login-box {  /* kotak login */
  max-width: 460px;  /* batasi lebar agar tidak terlalu lebar */
}  /* akhir aturan .login-box */

label {  /* label form */
  display: block;  /* satu baris sendiri di atas input */
  margin-top: 14px;  /* jarak dari elemen di atasnya */
  margin-bottom: 6px;  /* jarak ke input di bawahnya */
}  /* akhir aturan label */

input, select {  /* kolom isian dan dropdown */
  width: 100%;  /* selebar wadah */
  padding: 10px;  /* ruang di dalam isian */
  font-size: 16px;  /* ukuran teks (16px mencegah zoom otomatis di ponsel) */
  color: #17324d;  /* warna teks */
  background-color: #ffffff;  /* latar putih */
  border: 1px solid #94a3b8;  /* garis tepi abu */
  border-radius: 6px;  /* sudut membulat */
}  /* akhir aturan input, select */

button {  /* tombol */
  padding: 10px 14px;  /* ruang dalam: atas-bawah 10px, kiri-kanan 14px */
  margin: 8px 6px 8px 0;  /* jarak: atas 8, kanan 6, bawah 8, kiri 0 */
  font-size: 15px;  /* ukuran teks tombol */
  background-color: #0369a1;  /* latar biru */
  color: #ffffff;  /* teks putih */
  border: 0;  /* tanpa garis tepi */
  border-radius: 6px;  /* sudut membulat */
  cursor: pointer;  /* kursor tangan saat diarahkan */
}  /* akhir aturan button */

button:hover {  /* tombol saat kursor di atasnya */
  background-color: #075985;  /* biru lebih gelap */
}  /* akhir aturan button:hover */

button:disabled {  /* tombol yang dinonaktifkan */
  background-color: #64748b;  /* abu */
  cursor: not-allowed;  /* kursor tanda dilarang */
}  /* akhir aturan button:disabled */

.bahaya {  /* tombol aksi berbahaya (hapus/reset) */
  background-color: #b91c1c;  /* merah */
}  /* akhir aturan .bahaya */

.bahaya:hover {  /* tombol bahaya saat disorot kursor */
  background-color: #991b1b;  /* merah lebih gelap */
}  /* akhir aturan .bahaya:hover */

.pesan {  /* teks pesan status/error */
  color: #9f1239;  /* merah tua */
  min-height: 24px;  /* tinggi minimum agar tata letak tidak melompat saat pesan muncul */
  font-weight: bold;  /* teks tebal */
}  /* akhir aturan .pesan */

.nomor {  /* nomor antrean besar */
  font-size: 42px;  /* ukuran besar */
  font-weight: bold;  /* tebal */
  color: #0369a1;  /* biru */
  margin: 18px 0;  /* jarak atas-bawah */
}  /* akhir aturan .nomor */

.layar .nomor {  /* nomor di halaman layar (body.layar) */
  font-size: 64px;  /* lebih besar agar terbaca dari jauh */
}  /* akhir aturan .layar .nomor */

.aksi {  /* wadah tombol aksi */
  display: flex;  /* susun tombol sejajar */
  flex-wrap: wrap;  /* boleh turun baris bila sempit */
}  /* akhir aturan .aksi */

.table-wrap {  /* pembungkus tabel */
  overflow-x: auto;  /* tampilkan scroll horizontal bila tabel terlalu lebar */
}  /* akhir aturan .table-wrap */

table {  /* tabel */
  width: 100%;  /* selebar wadah */
  border-collapse: collapse;  /* gabungkan garis tepi sel */
}  /* akhir aturan table */

th, td {  /* sel judul dan sel isi tabel */
  padding: 12px;  /* ruang di dalam sel */
  text-align: left;  /* rata kiri */
  border-bottom: 1px solid #cbd5e1;  /* garis pemisah antar baris */
}  /* akhir aturan th, td */

@media (max-width: 700px) {  /* aturan khusus layar selebar maksimal 700px (ponsel) */
  .grid {  /* grid pada layar kecil */
    grid-template-columns: 1fr;  /* jadi satu kolom */
  }  /* akhir .grid */
  .card {  /* kartu pada layar kecil */
    padding: 16px;  /* ruang dalam diperkecil */
  }  /* akhir .card */
  .layar .nomor {  /* nomor layar pada layar kecil */
    font-size: 48px;  /* ukuran diperkecil agar muat */
  }  /* akhir .layar .nomor */
}  /* akhir media query */
```

##### `ambil-antrian.html`

```html
<!DOCTYPE html>  <!-- deklarasi dokumen HTML5 -->
<html lang="id">  <!-- elemen akar; bahasa Indonesia -->
<head>  <!-- awal metadata dan resource -->
  <meta charset="UTF-8">  <!-- encoding UTF-8 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- tampilan responsif -->
  <title>Ambil Antrian - Rumah Sakit</title>  <!-- judul tab browser -->
  <link rel="stylesheet" href="style.css">  <!-- memuat stylesheet bersama -->
  <script src="dist/auth.js" defer></script>  <!-- fungsi guard login; dimuat sebelum ambil.js -->
  <script src="dist/storage.js" defer></script>  <!-- fungsi penyimpanan dan aturan antrean; dimuat sebelum ambil.js -->
  <script src="dist/ambil.js" defer></script>  <!-- logika halaman ambil antrean -->
</head>  <!-- akhir head -->
<body>  <!-- awal isi halaman -->
  <div class="container">  <!-- pembungkus utama -->
    <div class="navbar">  <!-- bilah navigasi -->
      <strong>Rumah Sakit</strong>  <!-- nama halaman -->
      <span id="identitas"></span>  <!-- diisi "nama | role" oleh pasangNavigasi -->
      <a href="operator.html">Panel operator</a>  <!-- tautan ke panel operator -->
      <a href="layar.html">Layar antrean</a>  <!-- tautan ke layar antrean -->
      <button id="logoutBtn" type="button">Logout</button>  <!-- tombol keluar -->
    </div>  <!-- akhir navbar -->
    <h1>Ambil nomor antrean</h1>  <!-- judul halaman -->
    <div class="grid">  <!-- grid dua kolom: form dan hasil -->
      <div class="card">  <!-- kartu form pengambilan tiket -->
        <form id="ambilForm">  <!-- form ambil tiket; id dipakai ambil.ts -->
          <label for="ambilJenis">Layanan aktif</label>  <!-- label dropdown layanan -->
          <select id="ambilJenis" required></select>  <!-- dropdown layanan aktif, diisi isiPilihanJenis -->
          <label for="ambilPrioritas">Prioritas</label>  <!-- label dropdown prioritas -->
          <select id="ambilPrioritas">  <!-- dropdown prioritas -->
            <option value="Normal">Normal</option>  <!-- pilihan prioritas Normal -->
            <option value="Lansia">Lansia</option>  <!-- pilihan prioritas Lansia -->
            <option value="Disabilitas">Disabilitas</option>  <!-- pilihan prioritas Disabilitas -->
            <option value="VIP">VIP</option>  <!-- pilihan prioritas VIP -->
          </select>  <!-- akhir dropdown prioritas -->
          <button type="submit">Ambil tiket</button>  <!-- tombol kirim form -->
        </form>  <!-- akhir form -->
        <p id="ambilPesan" class="pesan"></p>  <!-- tempat pesan sukses/error -->
      </div>  <!-- akhir kartu form -->
      <div class="card">  <!-- kartu hasil tiket -->
        <h2>Tiket Anda</h2>  <!-- judul kartu -->
        <p id="hasilNomor" class="nomor">-</p>  <!-- nomor tiket besar; "-" sebelum ada tiket -->
        <p id="hasilDetail">Silakan pilih layanan dan prioritas.</p>  <!-- detail layanan dan prioritas -->
      </div>  <!-- akhir kartu hasil -->
    </div>  <!-- akhir grid -->
  </div>  <!-- akhir container -->
</body>  <!-- akhir isi halaman -->
</html>  <!-- akhir dokumen -->
```

##### `src/ambil.ts`

```ts
function mulaiAmbil(): void {  // menyiapkan halaman ambil antrean
  if (!cekLogin(false)) return;  // wajib login; bila tidak, berhenti (dialihkan ke login)
  pasangNavigasi();  // tampilkan identitas dan pasang tombol logout

  const form = document.getElementById("ambilForm") as HTMLFormElement;  // form ambil tiket
  const jenis = document.getElementById("ambilJenis") as HTMLSelectElement;  // dropdown layanan
  const prioritas = document.getElementById("ambilPrioritas") as HTMLSelectElement;  // dropdown prioritas
  const nomor = document.getElementById("hasilNomor") as HTMLParagraphElement;  // elemen nomor tiket besar
  const detail = document.getElementById("hasilDetail") as HTMLParagraphElement;  // elemen detail tiket
  const pesan = document.getElementById("ambilPesan") as HTMLParagraphElement;  // elemen pesan sukses/error
  let masterSebelumnya: string | null | undefined = undefined;  // salinan data layanan terakhir; undefined = belum pernah dibaca

  function perbaruiPilihan(): void {  // menyegarkan dropdown hanya bila data layanan berubah
    try {  // awal blok yang mungkin error
      const masterSekarang = localStorage.getItem("jenisAntrian");  // baca data layanan mentah (string JSON)
      if (masterSekarang !== masterSebelumnya) {  // berbeda dari pembacaan terakhir
        isiPilihanJenis(jenis);  // bangun ulang opsi dropdown
        masterSebelumnya = masterSekarang;  // simpan sebagai pembanding berikutnya
      }  // akhir if
    } catch (error) { pesan.textContent = pesanError(error); }  // tampilkan pesan bila gagal
  }  // akhir perbaruiPilihan

  form.addEventListener("submit", (event) => {  // saat form dikirim
    event.preventDefault();  // cegah reload halaman
    try {  // awal blok yang mungkin error
      const pilihanPrioritas = prioritas.value;  // ambil prioritas terpilih (string)
      if (!prioritasValid(pilihanPrioritas)) throw new Error("Prioritas tidak valid.");  // tolak bila tidak valid
      const tiket = buatTiket(jenis.value, pilihanPrioritas);  // terbitkan tiket (membaca ulang layanan, menolak yang nonaktif)
      const layanan = cariJenis(tiket.kodeJenis);  // cari layanan untuk menampilkan namanya
      nomor.textContent = tiket.label;  // tampilkan nomor tiket
      detail.textContent = (layanan === null ? tiket.kodeJenis : layanan.nama) +  // nama layanan (atau kode bila tak ditemukan)
        " | " + tiket.prioritas;  // pemisah lalu prioritas tiket
      pesan.textContent = "Tiket langsung masuk antrean. Simpan nomor ini.";  // pesan sukses
    } catch (error) { pesan.textContent = pesanError(error); }  // tampilkan pesan error (mis. layanan nonaktif)
  });  // akhir handler submit

  perbaruiPilihan();  // isi dropdown saat halaman dibuka
  setInterval(perbaruiPilihan, 3000);  // cek perubahan layanan tiap 3 detik
}  // akhir mulaiAmbil

mulaiAmbil();  // jalankan halaman saat script dimuat
```

##### `layar.html`

```html
<!DOCTYPE html>  <!-- deklarasi dokumen HTML5 -->
<html lang="id">  <!-- elemen akar; bahasa Indonesia -->
<head>  <!-- awal metadata dan resource -->
  <meta charset="UTF-8">  <!-- encoding UTF-8 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- tampilan responsif -->
  <title>Layar Antrian - Rumah Sakit</title>  <!-- judul tab browser -->
  <link rel="stylesheet" href="style.css">  <!-- memuat stylesheet bersama -->
  <script src="dist/auth.js" defer></script>  <!-- fungsi guard login; dimuat sebelum layar.js -->
  <script src="dist/storage.js" defer></script>  <!-- fungsi penyimpanan dan aturan antrean; dimuat sebelum layar.js -->
  <script src="dist/layar.js" defer></script>  <!-- logika layar antrean -->
</head>  <!-- akhir head -->
<body class="layar">  <!-- class "layar" memperbesar nomor lewat CSS -->
  <div class="container">  <!-- pembungkus utama -->
    <div class="navbar">  <!-- bilah navigasi -->
      <strong>Layar antrean rumah sakit</strong>  <!-- nama halaman -->
      <span id="identitas"></span>  <!-- diisi "nama | role" oleh pasangNavigasi -->
      <a href="operator.html">Panel operator</a>  <!-- tautan ke panel operator -->
      <a href="ambil-antrian.html">Ambil antrean</a>  <!-- tautan ke halaman ambil antrean -->
      <button id="logoutBtn" type="button">Logout</button>  <!-- tombol keluar -->
      <button id="fullscreenBtn" type="button">Layar penuh</button>  <!-- tombol Fullscreen API -->
    </div>  <!-- akhir navbar -->
    <h1>Nomor yang sedang dipanggil</h1>  <!-- judul halaman -->
    <p id="layarPesan" class="pesan"></p>  <!-- tempat pesan error layar -->
    <div id="layarKartu" class="grid"></div>  <!-- wadah kartu layanan yang dibuat layar.ts -->
  </div>  <!-- akhir container -->
</body>  <!-- akhir isi halaman -->
</html>  <!-- akhir dokumen -->
```

##### `src/layar.ts`

```ts
function mulaiLayar(): void {  // menyiapkan halaman layar antrean
  if (!cekLogin(false)) return;  // wajib login; bila tidak, berhenti (dialihkan ke login)
  pasangNavigasi();  // tampilkan identitas dan pasang tombol logout

  const wadah = document.getElementById("layarKartu") as HTMLDivElement;  // wadah kartu layanan
  const pesan = document.getElementById("layarPesan") as HTMLParagraphElement;  // elemen pesan error
  const tombol = document.getElementById("fullscreenBtn") as HTMLButtonElement;  // tombol layar penuh

  function renderLayar(): void {  // menggambar ulang kartu semua layanan aktif
    const tiketData = bacaTiket();  // baca semua tiket terbaru
    wadah.innerHTML = "";  // kosongkan tampilan lama
    let jumlahLayanan = 0;  // penghitung layanan aktif yang ditampilkan
    for (const jenis of bacaJenis()) {  // telusuri semua layanan
      if (!jenis.aktif) continue;  // lewati layanan nonaktif
      jumlahLayanan++;  // hitung layanan aktif
      const kartu = document.createElement("div");  // elemen kartu
      kartu.className = "card";  // gaya kartu
      const judul = document.createElement("h2");  // judul kartu
      judul.textContent = jenis.kode + " - " + jenis.nama;  // isi "kode - nama"
      const sekarang = tiketDipanggil(jenis.kode, tiketData);  // tiket yang sedang dipanggil (atau null)
      const nomor = document.createElement("p");  // elemen nomor besar
      nomor.className = "nomor";  // gaya nomor besar
      nomor.textContent = sekarang === null ? "-" : sekarang.label;  // label tiket atau "-"
      const status = document.createElement("p");  // baris status panggilan
      status.textContent = sekarang === null ? "Belum ada panggilan" : "Sedang dipanggil";  // teks sesuai ada/tidaknya panggilan
      const sisa = document.createElement("p");  // baris sisa antrean
      sisa.textContent = "Antrean tersisa: " + jumlahMenunggu(jenis.kode, tiketData);  // jumlah tiket berstatus Menunggu
      kartu.appendChild(judul);  // pasang judul ke kartu
      kartu.appendChild(nomor);  // pasang nomor
      kartu.appendChild(status);  // pasang status
      kartu.appendChild(sisa);  // pasang sisa antrean
      wadah.appendChild(kartu);  // pasang kartu ke halaman
    }  // akhir loop layanan
    if (jumlahLayanan === 0) wadah.textContent = "Belum ada layanan aktif.";  // tidak ada layanan aktif: tampilkan pesan
  }  // akhir renderLayar

  function perbaruiLayar(): void {  // membungkus render dengan penanganan error
    try { renderLayar(); }  // coba gambar ulang tampilan
    catch (error) { pesan.textContent = pesanError(error); }  // bila gagal, tampilkan pesan
  }  // akhir perbaruiLayar

  tombol.addEventListener("click", async () => {  // saat tombol layar penuh diklik (async karena API mengembalikan Promise)
    try {  // awal blok yang mungkin error
      if (!document.fullscreenEnabled) {  // browser tidak mendukung layar penuh
        throw new Error("Layar penuh tidak tersedia di browser ini.");  // tampilkan pesan
      }  // akhir cek dukungan
      if (document.fullscreenElement === null) {  // belum dalam mode layar penuh
        await document.documentElement.requestFullscreen();  // masuk layar penuh (harus dipicu klik pengguna)
      } else {  // sedang layar penuh
        await document.exitFullscreen();  // keluar dari layar penuh
      }  // akhir toggle layar penuh
      pesan.textContent = "";  // hapus pesan lama bila berhasil
    } catch (error) { pesan.textContent = pesanError(error); }  // tampilkan pesan bila gagal
  });  // akhir handler klik

  document.addEventListener("fullscreenchange", () => {  // dipicu saat status layar penuh berubah (termasuk tombol Esc)
    tombol.textContent = document.fullscreenElement === null ?  // cek apakah masih layar penuh
      "Layar penuh" : "Keluar layar penuh";  // teks tombol mengikuti status
  });  // akhir handler fullscreenchange

  perbaruiLayar();  // gambar tampilan pertama kali
  setInterval(perbaruiLayar, 3000);  // segarkan tiap 3 detik
}  // akhir mulaiLayar

mulaiLayar();  // jalankan layar saat script dimuat
```

### Integrasi bersama dan pertanyaan presentasi

- Urutan demo keseluruhan: login/penentuan role → dashboard membuat layanan → tiket dibuat manual atau oleh pengguna → operator memanggil tiket → layar menampilkan panggilan.
- Semua role wajib login. Admin/moderator dapat membuka dashboard; semua role yang login dapat membuka operator, ambil antrean, dan layar.
- Logout menghapus sesi, reset menghapus tiket dan mengulang nomor, sedangkan hapus layanan menghapus layanan beserta tiket yang terkait.
- **Mengapa nomor disimpan pada layanan?** Supaya nomor tidak kembali ke awal hanya karena tiket telah selesai atau dilewati.
- **Apakah VIP selalu di atas Lansia/Disabilitas?** Tidak. Implementasi menjadikan semua prioritas non-Normal satu kelompok dan mempertahankan urutan penerbitan di dalamnya.
- **Mengapa layanan nonaktif masih ditampilkan operator?** Agar tiket yang sudah terbit tetap dapat diselesaikan.
- **Mengapa halaman disebut publik tetapi perlu login?** “Publik” menjelaskan fungsi halaman dalam aplikasi; revisi requirement menetapkan semua halaman harus dilindungi login.
- **Apakah guard browser aman untuk produksi?** Tidak. Local Storage dapat dimodifikasi. Sistem produksi memerlukan autentikasi, otorisasi, dan penyimpanan yang divalidasi di server.
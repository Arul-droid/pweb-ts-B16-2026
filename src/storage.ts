function bacaJenis(): JenisAntrian[] {
  const teks = localStorage.getItem("jenisAntrian");
  if (teks === null) return [];
  return JSON.parse(teks) as JenisAntrian[];
}

function simpanJenis(data: JenisAntrian[]): void {
  localStorage.setItem("jenisAntrian", JSON.stringify(data));
}

function bacaTiket(): TiketAntrian[] {
  const teks = localStorage.getItem("tiketAntrian");
  if (teks === null) return [];
  return JSON.parse(teks) as TiketAntrian[];
}

function simpanTiket(data: TiketAntrian[]): void {
  localStorage.setItem("tiketAntrian", JSON.stringify(data));
}

function cariJenis(kode: string): JenisAntrian | null {
  for (const jenis of bacaJenis()) {
    if (jenis.kode === kode) return jenis;
  }
  return null;
}

function prioritasValid(teks: string): teks is PrioritasTiket {
  return teks === "Normal" || teks === "Lansia" ||
    teks === "Disabilitas" || teks === "VIP";
}

function formatNomor(kode: string, nomor: number): string {
  let angka = String(nomor);
  if (nomor < 10) angka = "00" + angka;
  else if (nomor < 100) angka = "0" + angka;
  return kode + "-" + angka;
}

function buatTiket(kode: string, prioritas: PrioritasTiket): TiketAntrian {
  // Selalu baca ulang data terbaru sebelum mengubahnya.
  const semuaJenis = bacaJenis();
  let layanan: JenisAntrian | null = null;

  for (const jenis of semuaJenis) {
    if (jenis.kode === kode) layanan = jenis;
  }

  if (layanan === null || !layanan.aktif) {
    throw new Error("Layanan tidak tersedia atau sedang nonaktif.");
  }

  if (!prioritasValid(prioritas)) {
    throw new Error("Prioritas tidak valid.");
  }

  if (layanan.nomorTerakhir >= 999) {
    throw new Error("Nomor sudah mencapai 999. Hubungi admin untuk reset.");
  }

  const nomor = layanan.nomorTerakhir + 1;

  const tiket: TiketAntrian = {
    kodeJenis: kode,
    nomor: nomor,
    label: formatNomor(kode, nomor),
    prioritas: prioritas,
    status: "Menunggu"
  };

  const semuaTiket = bacaTiket();
  semuaTiket.push(tiket);

  layanan.nomorTerakhir = nomor;

  simpanJenis(semuaJenis);
  simpanTiket(semuaTiket);

  return tiket;
}

function tiketDipanggil(
  kode: string,
  data: TiketAntrian[]
): TiketAntrian | null {
  for (const tiket of data) {
    if (
      tiket.kodeJenis === kode &&
      tiket.status === "Dipanggil"
    ) {
      return tiket;
    }
  }

  return null;
}

function tiketBerikutnya(
  kode: string,
  data: TiketAntrian[]
): TiketAntrian | null {
  let normalPertama: TiketAntrian | null = null;

  for (const tiket of data) {
    if (
      tiket.kodeJenis !== kode ||
      tiket.status !== "Menunggu"
    ) {
      continue;
    }

    // Array tersimpan sesuai urutan penerbitan tiket.
    if (tiket.prioritas !== "Normal") {
      return tiket;
    }

    if (normalPertama === null) {
      normalPertama = tiket;
    }
  }

  return normalPertama;
}

function jumlahMenunggu(
  kode: string,
  data: TiketAntrian[]
): number {
  let jumlah = 0;

  for (const tiket of data) {
    if (
      tiket.kodeJenis === kode &&
      tiket.status === "Menunggu"
    ) {
      jumlah++;
    }
  }

  return jumlah;
}

function isiPilihanJenis(select: HTMLSelectElement): void {
  const pilihanLama = select.value;

  select.innerHTML = "";

  const awal = document.createElement("option");
  awal.value = "";
  awal.textContent = "Pilih layanan";
  select.appendChild(awal);

  for (const jenis of bacaJenis()) {
    if (!jenis.aktif) continue;

    const pilihan = document.createElement("option");
    pilihan.value = jenis.kode;
    pilihan.textContent = jenis.kode + " - " + jenis.nama;

    select.appendChild(pilihan);
  }

  // Pertahankan pilihan jika layanan itu masih aktif.
  const lama = cariJenis(pilihanLama);

  if (lama !== null && lama.aktif) {
    select.value = pilihanLama;
  }
}

function pesanError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan. Periksa Console browser.";
}
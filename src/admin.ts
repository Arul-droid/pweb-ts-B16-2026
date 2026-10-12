function namaSudahAda(nama: string, kecualiKode: string): boolean {
  for (const jenis of bacaJenis()) {
    if (jenis.kode !== kecualiKode &&
        jenis.nama.toLowerCase() === nama.toLowerCase()) return true;
  }
  return false;
}

function mulaiAdmin(): void {
  if (!cekLogin(true)) return;
  pasangNavigasi();

  const form = document.getElementById("jenisForm") as HTMLFormElement;
  const kodeInput = document.getElementById("kodeJenis") as HTMLInputElement;
  const namaInput = document.getElementById("namaJenis") as HTMLInputElement;
  const body = document.getElementById("jenisBody") as HTMLTableSectionElement;
  const pesan = document.getElementById("adminPesan") as HTMLParagraphElement;
  const manual = document.getElementById("manualForm") as HTMLFormElement;
  const manualJenis = document.getElementById("manualJenis") as HTMLSelectElement;
  const manualPrioritas = document.getElementById("manualPrioritas") as HTMLSelectElement;
  const hasil = document.getElementById("tiketManual") as HTMLParagraphElement;
  const reset = document.getElementById("resetBtn") as HTMLButtonElement;

  function renderAdmin(): void {
    body.innerHTML = "";

    for (const jenis of bacaJenis()) {
      const baris = document.createElement("tr");

      const selKode = document.createElement("td");
      selKode.textContent = jenis.kode;

      const selNama = document.createElement("td");
      const editNama = document.createElement("input");
      editNama.type = "text";
      editNama.value = jenis.nama;
      editNama.setAttribute("aria-label", "Nama layanan " + jenis.kode);
      selNama.appendChild(editNama);

      const selStatus = document.createElement("td");
      selStatus.textContent = jenis.aktif ? "Aktif" : "Nonaktif";

      const selAksi = document.createElement("td");

      const simpan = document.createElement("button");
      simpan.type = "button";
      simpan.textContent = "Simpan nama";

      simpan.addEventListener("click", () => {
        if (!cekLogin(true)) return;

        try {
          const namaBaru = editNama.value.trim();

          if (namaBaru === "") {
            throw new Error("Nama tidak boleh kosong.");
          }

          if (namaSudahAda(namaBaru, jenis.kode)) {
            throw new Error("Nama layanan sudah digunakan.");
          }

          const data = bacaJenis();

          for (const item of data) {
            if (item.kode === jenis.kode) {
              item.nama = namaBaru;
            }
          }

          simpanJenis(data);
          pesan.textContent = "Nama layanan diperbarui.";
          renderAdmin();

        } catch (error) {
          pesan.textContent = pesanError(error);
        }
      });

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.textContent = jenis.aktif ? "Nonaktifkan" : "Aktifkan";

      toggle.addEventListener("click", () => {
        if (!cekLogin(true)) return;

        try {
          const data = bacaJenis();

          for (const item of data) {
            if (item.kode === jenis.kode) {
              item.aktif = !item.aktif;
            }
          }

          simpanJenis(data);
          pesan.textContent = "Status layanan diperbarui.";
          renderAdmin();

        } catch (error) {
          pesan.textContent = pesanError(error);
        }
      });

      const hapus = document.createElement("button");
      hapus.type = "button";
      hapus.className = "bahaya";
      hapus.textContent = "Hapus";

      hapus.addEventListener("click", () => {
        if (!cekLogin(true)) return;

        if (
          !confirm(
            "Hapus layanan " +
            jenis.kode +
            " beserta seluruh tiketnya?"
          )
        ) return;

        try {
          const sisaJenis: JenisAntrian[] = [];
          const sisaTiket: TiketAntrian[] = [];

          for (const item of bacaJenis()) {
            if (item.kode !== jenis.kode) {
              sisaJenis.push(item);
            }
          }

          for (const tiket of bacaTiket()) {
            if (tiket.kodeJenis !== jenis.kode) {
              sisaTiket.push(tiket);
            }
          }

          simpanJenis(sisaJenis);
          simpanTiket(sisaTiket);

          hasil.textContent = "";
          pesan.textContent = "Layanan dan tiketnya dihapus.";
          renderAdmin();

        } catch (error) {
          pesan.textContent = pesanError(error);
        }
      });

      selAksi.appendChild(simpan);
      selAksi.appendChild(toggle);
      selAksi.appendChild(hapus);

      baris.appendChild(selKode);
      baris.appendChild(selNama);
      baris.appendChild(selStatus);
      baris.appendChild(selAksi);

      body.appendChild(baris);
    }

    isiPilihanJenis(manualJenis);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cekLogin(true)) return;

    try {
      const kode = kodeInput.value.trim().toUpperCase();
      const nama = namaInput.value.trim();

      if (
        kode.length !== 1 ||
        !"ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(kode)
      ) {
        throw new Error("Kode harus satu huruf A-Z.");
      }

      if (nama === "") {
        throw new Error("Nama layanan tidak boleh kosong.");
      }

      if (cariJenis(kode) !== null || namaSudahAda(nama, "")) {
        throw new Error("Kode atau nama layanan sudah digunakan.");
      }

      const data = bacaJenis();

      data.push({
        kode: kode,
        nama: nama,
        aktif: true,
        nomorTerakhir: 0
      });

      simpanJenis(data);

      form.reset();

      pesan.textContent = "Layanan berhasil ditambahkan.";
      renderAdmin();

    } catch (error) {
      pesan.textContent = pesanError(error);
    }
  });

  manual.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cekLogin(true)) return;

    try {
      const prioritas = manualPrioritas.value;

      if (!prioritasValid(prioritas)) {
        throw new Error("Prioritas tidak valid.");
      }

      const tiket = buatTiket(
        manualJenis.value,
        prioritas
      );

      hasil.textContent =
        tiket.label + " | " + tiket.prioritas;

      pesan.textContent =
        "Tiket manual langsung masuk antrean.";

    } catch (error) {
      pesan.textContent = pesanError(error);
    }
  });

  reset.addEventListener("click", () => {
    if (!cekLogin(true)) return;

    if (
      !confirm(
        "Kosongkan semua tiket dan mulai nomor dari 001?"
      )
    ) return;

    try {
      const data = bacaJenis();

      for (const jenis of data) {
        jenis.nomorTerakhir = 0;
      }

      simpanJenis(data);
      simpanTiket([]);

      hasil.textContent = "";

      pesan.textContent =
        "Seluruh antrean direset. Tiket berikutnya mulai 001.";

      renderAdmin();

    } catch (error) {
      pesan.textContent = pesanError(error);
    }
  });

  try {
    renderAdmin();
  } catch (error) {
    pesan.textContent = pesanError(error);
  }
}

mulaiAdmin();
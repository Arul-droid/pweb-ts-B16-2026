function mulaiAmbil(): void {
  const form = document.getElementById("ambilForm") as HTMLFormElement;
  const jenis = document.getElementById("ambilJenis") as HTMLSelectElement;
  const prioritas = document.getElementById("ambilPrioritas") as HTMLSelectElement;
  const nomor = document.getElementById("hasilNomor") as HTMLParagraphElement;
  const detail = document.getElementById("hasilDetail") as HTMLParagraphElement;
  const pesan = document.getElementById("ambilPesan") as HTMLParagraphElement;
  let masterSebelumnya: string | null | undefined = undefined;

  function perbaruiPilihan(): void {
    try {
      const masterSekarang = localStorage.getItem("jenisAntrian");
      if (masterSekarang !== masterSebelumnya) {
        isiPilihanJenis(jenis);
        masterSebelumnya = masterSekarang;
      }
    } catch (error) { pesan.textContent = pesanError(error); }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const pilihanPrioritas = prioritas.value;
      if (!prioritasValid(pilihanPrioritas)) throw new Error("Prioritas tidak valid.");
      const tiket = buatTiket(jenis.value, pilihanPrioritas);
      const layanan = cariJenis(tiket.kodeJenis);
      nomor.textContent = tiket.label;
      detail.textContent = (layanan === null ? tiket.kodeJenis : layanan.nama) +
        " | " + tiket.prioritas;
      pesan.textContent = "Tiket langsung masuk antrean. Simpan nomor ini.";
    } catch (error) { pesan.textContent = pesanError(error); }
  });

  perbaruiPilihan();
  setInterval(perbaruiPilihan, 3000);
}

mulaiAmbil();

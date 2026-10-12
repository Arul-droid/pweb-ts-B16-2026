function mulaiLayar(): void {
  const wadah = document.getElementById("layarKartu") as HTMLDivElement;
  const pesan = document.getElementById("layarPesan") as HTMLParagraphElement;
  const tombol = document.getElementById("fullscreenBtn") as HTMLButtonElement;

  function renderLayar(): void {
    const tiketData = bacaTiket();
    wadah.innerHTML = "";
    let jumlahLayanan = 0;
    for (const jenis of bacaJenis()) {
      if (!jenis.aktif) continue;
      jumlahLayanan++;
      const kartu = document.createElement("div");
      kartu.className = "card";
      const judul = document.createElement("h2");
      judul.textContent = jenis.kode + " - " + jenis.nama;
      const sekarang = tiketDipanggil(jenis.kode, tiketData);
      const nomor = document.createElement("p");
      nomor.className = "nomor";
      nomor.textContent = sekarang === null ? "-" : sekarang.label;
      const status = document.createElement("p");
      status.textContent = sekarang === null ? "Belum ada panggilan" : "Sedang dipanggil";
      const sisa = document.createElement("p");
      sisa.textContent = "Antrean tersisa: " + jumlahMenunggu(jenis.kode, tiketData);
      kartu.appendChild(judul);
      kartu.appendChild(nomor);
      kartu.appendChild(status);
      kartu.appendChild(sisa);
      wadah.appendChild(kartu);
    }
    if (jumlahLayanan === 0) wadah.textContent = "Belum ada layanan aktif.";
  }

  function perbaruiLayar(): void {
    try { renderLayar(); }
    catch (error) { pesan.textContent = pesanError(error); }
  }

  tombol.addEventListener("click", async () => {
    try {
      if (!document.fullscreenEnabled) {
        throw new Error("Layar penuh tidak tersedia di browser ini.");
      }
      if (document.fullscreenElement === null) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      pesan.textContent = "";
    } catch (error) { pesan.textContent = pesanError(error); }
  });

  document.addEventListener("fullscreenchange", () => {
    tombol.textContent = document.fullscreenElement === null ?
      "Layar penuh" : "Keluar layar penuh";
  });

  perbaruiLayar();
  setInterval(perbaruiLayar, 3000);
}

mulaiLayar();

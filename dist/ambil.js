"use strict";
function mulaiAmbil() {
    const form = document.getElementById("ambilForm");
    const jenis = document.getElementById("ambilJenis");
    const prioritas = document.getElementById("ambilPrioritas");
    const nomor = document.getElementById("hasilNomor");
    const detail = document.getElementById("hasilDetail");
    const pesan = document.getElementById("ambilPesan");
    let masterSebelumnya = undefined;
    function perbaruiPilihan() {
        try {
            const masterSekarang = localStorage.getItem("jenisAntrian");
            if (masterSekarang !== masterSebelumnya) {
                isiPilihanJenis(jenis);
                masterSebelumnya = masterSekarang;
            }
        }
        catch (error) {
            pesan.textContent = pesanError(error);
        }
    }
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        try {
            const pilihanPrioritas = prioritas.value;
            if (!prioritasValid(pilihanPrioritas))
                throw new Error("Prioritas tidak valid.");
            const tiket = buatTiket(jenis.value, pilihanPrioritas);
            const layanan = cariJenis(tiket.kodeJenis);
            nomor.textContent = tiket.label;
            detail.textContent = (layanan === null ? tiket.kodeJenis : layanan.nama) +
                " | " + tiket.prioritas;
            pesan.textContent = "Tiket langsung masuk antrean. Simpan nomor ini.";
        }
        catch (error) {
            pesan.textContent = pesanError(error);
        }
    });
    perbaruiPilihan();
    setInterval(perbaruiPilihan, 3000);
}
mulaiAmbil();

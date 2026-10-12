"use strict";
function ubahAntrian(kode, aksi) {
    const data = bacaTiket();
    const sekarang = tiketDipanggil(kode, data);
    if (aksi === "panggil") {
        if (sekarang !== null)
            sekarang.status = "Selesai";
        const berikut = tiketBerikutnya(kode, data);
        if (berikut !== null)
            berikut.status = "Dipanggil";
    }
    else if (aksi === "selesai") {
        if (sekarang !== null)
            sekarang.status = "Selesai";
    }
    else {
        if (sekarang !== null)
            sekarang.status = "Dilewati";
    }
    simpanTiket(data);
}
function mulaiOperator() {
    if (!cekLogin(false))
        return;
    pasangNavigasi();
    const wadah = document.getElementById("operatorKartu");
    const pesan = document.getElementById("operatorPesan");
    function renderOperator() {
        if (!cekLogin(false))
            return;
        const jenisData = bacaJenis();
        const tiketData = bacaTiket();
        wadah.innerHTML = "";
        if (jenisData.length === 0) {
            wadah.textContent = "Belum ada layanan. Admin perlu menambah layanan.";
            return;
        }
        for (const jenis of jenisData) {
            const kartu = document.createElement("div");
            kartu.className = "card";
            const judul = document.createElement("h2");
            judul.textContent = jenis.kode + " - " + jenis.nama;
            const status = document.createElement("p");
            status.textContent = jenis.aktif ? "Layanan aktif" : "Nonaktif untuk tiket baru";
            const sekarang = tiketDipanggil(jenis.kode, tiketData);
            const berikut = tiketBerikutnya(jenis.kode, tiketData);
            const nomor = document.createElement("p");
            nomor.className = "nomor";
            nomor.textContent = sekarang === null ? "-" : sekarang.label;
            const detail = document.createElement("p");
            detail.textContent = "Sedang dipanggil: " +
                (sekarang === null ? "Tidak ada" : sekarang.prioritas);
            const selanjutnya = document.createElement("p");
            selanjutnya.textContent = "Berikutnya: " + (berikut === null ? "-" :
                berikut.label + " (" + berikut.prioritas + ")");
            const sisa = document.createElement("p");
            sisa.textContent = "Menunggu: " + jumlahMenunggu(jenis.kode, tiketData);
            const tombolWadah = document.createElement("div");
            tombolWadah.className = "aksi";
            function tombolOperator(teks, aksi, nonaktif) {
                const tombol = document.createElement("button");
                tombol.type = "button";
                tombol.textContent = teks;
                tombol.disabled = nonaktif;
                tombol.addEventListener("click", () => {
                    if (!cekLogin(false))
                        return;
                    try {
                        ubahAntrian(jenis.kode, aksi);
                        pesan.textContent = "Antrean " + jenis.kode + " diperbarui.";
                        renderOperator();
                    }
                    catch (error) {
                        pesan.textContent = pesanError(error);
                    }
                });
                return tombol;
            }
            tombolWadah.appendChild(tombolOperator("Panggil berikutnya", "panggil", berikut === null));
            tombolWadah.appendChild(tombolOperator("Selesai", "selesai", sekarang === null));
            tombolWadah.appendChild(tombolOperator("Lewati", "lewati", sekarang === null));
            kartu.appendChild(judul);
            kartu.appendChild(status);
            kartu.appendChild(nomor);
            kartu.appendChild(detail);
            kartu.appendChild(selanjutnya);
            kartu.appendChild(sisa);
            kartu.appendChild(tombolWadah);
            wadah.appendChild(kartu);
        }
    }
    function perbaruiOperator() {
        try {
            renderOperator();
        }
        catch (error) {
            pesan.textContent = pesanError(error);
        }
    }
    perbaruiOperator();
    setInterval(perbaruiOperator, 3000);
}
mulaiOperator();

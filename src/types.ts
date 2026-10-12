type RolePengguna = "admin" | "moderator" | "user";
type PrioritasTiket = "Normal" | "Lansia" | "Disabilitas" | "VIP";
type StatusTiket = "Menunggu" | "Dipanggil" | "Selesai" | "Dilewati";

interface JenisAntrian {
  kode: string;
  nama: string;
  aktif: boolean;
  nomorTerakhir: number;
}

interface TiketAntrian {
  kodeJenis: string;
  nomor: number;
  label: string;
  prioritas: PrioritasTiket;
  status: StatusTiket;
}

interface ResponsLogin {
  id: number;
  username: string;
  firstName: string;
  accessToken: string;
  role?: string;
}

interface PenggunaAPI {
  id: number;
  username: string;
  firstName: string;
  role: string;
}

interface ResponsFilterPengguna {
  users: PenggunaAPI[];
}
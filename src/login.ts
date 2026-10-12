async function roleDariServer(login: ResponsLogin): Promise<RolePengguna> {
  if (roleValid(login.role)) return login.role;

  // Jika respons login tidak membawa role, cocokkan ID pengguna login
  // dengan data server melalui endpoint filter yang digunakan soal.
  const daftarRole: RolePengguna[] = ["admin", "moderator", "user"];
  for (const targetRole of daftarRole) {
    const url = "https://dummyjson.com/users/filter?key=role&value=" +
      targetRole + "&limit=0";
    const respons = await fetch(url);
    if (!respons.ok) throw new Error("Gagal mengambil role dari server.");
    const data = await respons.json() as ResponsFilterPengguna;
    for (const pengguna of data.users) {
      if (pengguna.id === login.id && pengguna.username === login.username) {
        if (!roleValid(pengguna.role) || pengguna.role !== targetRole) {
          throw new Error("Role dari server tidak sesuai.");
        }
        return pengguna.role;
      }
    }
  }
  throw new Error("Role pengguna tidak ditemukan. Login dibatalkan.");
}

function mulaiLogin(): void {
  const form = document.getElementById("loginForm") as HTMLFormElement;
  const username = document.getElementById("username") as HTMLInputElement;
  const password = document.getElementById("password") as HTMLInputElement;
  const tombol = document.getElementById("loginBtn") as HTMLButtonElement;
  const pesan = document.getElementById("loginPesan") as HTMLParagraphElement;
  let memproses = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (memproses) return;
    memproses = true;
    tombol.disabled = true;
    tombol.textContent = "Memverifikasi...";
    pesan.textContent = "";
    hapusSesi();
    try {
      const respons = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value.trim(),
          password: password.value
        })
      });
      if (!respons.ok) {
        if (respons.status === 400 || respons.status === 401) {
          throw new Error("Username atau password salah.");
        }
        throw new Error("Server login bermasalah. Coba kembali.");
      }
      const data = await respons.json() as ResponsLogin;
      if (!data.accessToken || !data.firstName || !data.id || !data.username) {
        throw new Error("Respons login tidak lengkap.");
      }
      const role = await roleDariServer(data);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", role);
      localStorage.setItem("firstName", data.firstName);
      if (role === "admin" || role === "moderator") {
        window.location.href = "index.html";
      } else {
        window.location.href = "operator.html";
      }
    } catch (error) {
      hapusSesi();
      if (error instanceof TypeError) {
        pesan.textContent = "Koneksi gagal. Periksa internet dan coba lagi.";
      } else if (error instanceof Error) {
        pesan.textContent = error.message;
      } else {
        pesan.textContent = "Login gagal.";
      }
    } finally {
      memproses = false;
      tombol.disabled = false;
      tombol.textContent = "Masuk";
    }
  });
}

mulaiLogin();
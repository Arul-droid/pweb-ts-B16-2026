function roleValid(teks: string | null | undefined): teks is RolePengguna {
  return teks === "admin" || teks === "moderator" || teks === "user";
}

function hapusSesi(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("firstName");
}

function cekLogin(khususAdmin: boolean): boolean {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const nama = localStorage.getItem("firstName");

  if (!token || !roleValid(role) || !nama) {
    window.location.href = "login.html";
    return false;
  }

  if (khususAdmin && role !== "admin" && role !== "moderator") {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function pasangNavigasi(): void {
  const identitas = document.getElementById("identitas");
  const logout = document.getElementById("logoutBtn");

  if (identitas) {
    identitas.textContent =
      (localStorage.getItem("firstName") ?? "") +
      " | " +
      (localStorage.getItem("role") ?? "");
  }

  if (logout) {
    logout.addEventListener("click", () => {
      hapusSesi();
      window.location.href = "login.html";
    });
  }
}
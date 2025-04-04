document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Check if already logged in
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "main.html";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username,
          password,
        }
      );

      // Agar login muvaffaqiyatli bo'lsa
      const { token, user } = response.data;
      console.log("Login muvaffaqiyatli:", user);
      alert("Xush kelibsiz, " + user.name + "!");

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id); 
      window.location.href = "main.html"; // Profile sahifasiga o'tish uchun
    } catch (error) {
      console.error(error);
      alert("Login Xato");
    }
  });
});

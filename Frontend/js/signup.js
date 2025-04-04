

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form submission

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const profile_pic = document.getElementById("profile_pic").files[0];

    if (!name || !username || !password ) {
      alert("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector(".btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Yuborilmoqda...";
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("profile_pic", profile_pic);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/signup",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Foydalanuvchi muvaffaqiyatli qo'shildi!");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert(
        "Signup xato"
      );

      // Reset button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080/api";

  const form = document.getElementById("post-form");
  const textarea = form.querySelector("textarea");
  const fileInput = form.querySelector('input[type="file"]');
  const postsContainer = document.querySelector(".container-inner");
  const logoutBtn = document.querySelector(".logout-btn");
  const usernameDisplay = document.querySelector(".username");

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Get user data from token
  let userData;
  try {
    userData = JSON.parse(atob(token.split(".")[1]));
    usernameDisplay.textContent = `@${userData.username}`;
  } catch (error) {
    console.error("Token parsing error:", error);
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  // Liked posts uchun localStorage'ni tekshirish
  const getLikedPosts = () => {
    const likedPostsKey = `likedPosts-${userData.id}`;
    const likedPosts = localStorage.getItem(likedPostsKey);
    return likedPosts ? JSON.parse(likedPosts) : [];
  };

  // Liked posts ro'yxatini saqlash
  const saveLikedPosts = (likedPosts) => {
    const likedPostsKey = `likedPosts-${userData.id}`;
    localStorage.setItem(likedPostsKey, JSON.stringify(likedPosts));
  };

  // Post liked ekanligini tekshirish
  const isPostLiked = (postId) => {
    const likedPosts = getLikedPosts();
    return likedPosts.includes(postId);
  };

  // Make likePost and other functions global
  window.likePost = async (postId, btn) => {
    try {
      const res = await axios.post(
          `${API_URL}/likes/post/${postId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      const likedPosts = getLikedPosts();
      const isLiked = isPostLiked(postId);

      if (isLiked) {
        // Unlike qilish
        const updatedLikedPosts = likedPosts.filter(id => id !== postId);
        saveLikedPosts(updatedLikedPosts);
        btn.classList.remove('liked');
      } else {
        // Like qilish
        likedPosts.push(postId);
        saveLikedPosts(likedPosts);
        btn.classList.add('liked');
      }

      const likeCount = res.data.likes ? res.data.likes.length : 0;

      // Yurak ikonkasining rangini o'zgartirish
      const heartColor = !isLiked ? "red" : "";
      btn.innerHTML = `<span class="icon like" style="color: ${heartColor};"></span> Like (${likeCount})`;

    } catch (err) {
      console.error("Like error:", err);
      alert("Like qo'yishda xatolik yuz berdi");
    }
  };

  window.toggleCommentForm = (button, postId) => {
    const form = button.parentElement.nextElementSibling;
    form.style.display = form.style.display === "none" ? "block" : "none";
  };

  window.submitComment = async (postId, btn) => {
    const input = btn.previousElementSibling;
    const text = input.value.trim();

    if (!text) {
      alert("Kommentariya matni bo'sh bo'lishi mumkin emas!");
      return;
    }

    try {
      const res = await axios.post(
          `${API_URL}/comments/${postId}`,
          {
            text,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      const commentSection = btn.parentElement.nextElementSibling;
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment");
      commentDiv.innerHTML = `<h4>@${userData.username}</h4><p>${text}</p>`;
      commentSection.appendChild(commentDiv);
      input.value = "";
    } catch (err) {
      console.error("Comment error:", err);
      alert("Kommentariya yuborishda xatolik yuz berdi");
    }
  };

  async function fetchPosts() {
    try {
      const res = await axios.get(`${API_URL}/posts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);
      // Remove existing posts (except the form)
      const existingPosts = document.querySelectorAll(".post");
      existingPosts.forEach((post) => post.remove());

      const posts = res.data;
      if (Array.isArray(posts) && posts.length > 0) {
        posts.forEach((post) => renderPost(post));
      } else {
        console.log("No posts found or invalid data format");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      const errorMessage =
          err.response?.data || "Postlarni yuklashda xatolik yuz berdi";
      console.error(errorMessage);
    }
  }

  function renderPost(post) {
    if (!post) return;

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    // Handle missing user data
    const username = post.user?.username || "user";
    const profilePic = post.user?.profile_picture
        ? `/uploads/${post.user.profile_picture}`
        : "";

    // Post liked ekanligini tekshirish
    const liked = isPostLiked(post.id);
    const heartColor = liked ? "red" : "";

    postDiv.innerHTML = `
        <div class="post-header">
          <img src="http://localhost:8080${profilePic}" alt="User"  />
          <h3>@${username}</h3>
        </div>
        <p>${post.text || ""}</p>
        ${
        post.image
            ? `<img src="http://localhost:8080/uploads/${post.image}" alt="Post Image" style="max-width: 100%; border-radius: 8px; margin-top: 10px;" onerror="this.style.display='none'" />`
            : ""
    }
        <div class="actions">
          <button onclick="likePost('${post.id}', this)" class="${liked ? 'liked' : ''}">
            <span class="icon like" style="color: ${heartColor};"></span> Like (${post.likes?.length || 0})
          </button>
          <button onclick="toggleCommentForm(this, '${post.id}')">
            <span class="icon comment"></span> Comment
          </button>
        </div>
        <div class="comment-form" style="display: none;">
          <input type="text" placeholder="Write a comment..." />
          <button onclick="submitComment('${post.id}', this)">Send</button>
        </div>
        <div class="comment-section">
        </div>
      `;

   
    const formElement = document.querySelector("form");
    formElement.parentNode.insertBefore(postDiv, formElement.nextSibling);

    
    fetchComments(post.id, postDiv.querySelector(".comment-section"));
  }

  async function fetchComments(postId, commentSection) {
    try {
      const res = await axios.get(`${API_URL}/comments/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");
          commentDiv.innerHTML = `
             <h4>@${comment.user?.username || "user"}</h4>
             <p>${comment.text || ""}</p>
           `;
          commentSection.appendChild(commentDiv);
        });
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const text = textarea.value.trim();
    if (!text) {
      alert("Post matni bo'sh bo'lishi mumkin emas!");
      return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("image", file);

    try {
      const submitBtn = form.querySelector('input[type="submit"]');
      const originalBtnValue = submitBtn.value;
      submitBtn.value = "Yuborilmoqda...";
      submitBtn.disabled = true;

      const res = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      
      form.reset();
      submitBtn.value = originalBtnValue;
      submitBtn.disabled = false;

      
      if (res.data) {
        renderPost(res.data);
      } else {
        console.error("Invalid response data from post creation");
      }
    } catch (err) {
      console.error("Post error:", err);
      alert(
          "Post yuborishda xatolik yuz berdi: " +
          (err.response?.data?.error || "Noma'lum xatolik")
      );

  
     
      submitBtn.value = "Post";
      submitBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  fetchPosts();
});
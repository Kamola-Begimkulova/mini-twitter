const profileDIv = document.getElementById('profile');

function showProfile() {
    const id = localStorage.getItem('userId');
    axios.get(`https://mini-twitter-r2l9.vercel.app/api/users/${id}`)
    .then(response => {
        console.log(response.data);


        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (!data) {
            console.error('User not found');
            return;
        }

        profileDIv.innerHTML = `
            <h2>${data.name}</h2>
            <p>Username: ${data.username}</p>
            <img class="image_pic" src="https://mini-twitter-r2l9.vercel.app/uploads/${data.profile_picture}" alt="Profile Picture" width="100">
            
        `;
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
    });

}

showProfile();
const myPost = document.getElementById('mypost');

function showMyPost(id){
    axios.get(`https://mini-twitter-r2l9.vercel.app/api/posts/${id}`)
       .then(response => {
            console.log(response.data);
});
}
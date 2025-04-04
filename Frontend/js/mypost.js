const myPost = document.getElementById('mypost');

function showMyPost(id){
    axios.get(`http://localhost:8080/api/posts/${id}`)
       .then(response => {
            console.log(response.data);
});
}
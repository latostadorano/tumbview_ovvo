var api_1 = "https://api.tumblr.com/v2/blog/";
//var blog = "toust";
var blog = "web1995";
var api_2 = ".tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ";

var img;
var respuesta;
var time = 10;
var postsIndex = -1;   // para el loop de posts
var photosIndex = 0;  // para el loop de photos en el post

var postsPhotoArray = [];
var photosInPostArray = [];
var photosInPost = 0;

function setup() {
  clear ();
  var input = select('#question');
  input.changed(ask);
  var button = select('#submit');
  img = document.getElementById("foto");
  document.addEventListener("mousedown", (e) => e.preventDefault(), false); // Esto desabilita el doble click del mouse
}

function ask() {
  var url = api_1 + blog + api_2;
  loadJSON(url, gotData);
}

function gotData(tumblr) {
  // Si el array está vacío (aka: acabamos de cambiar de blog)
  // Loop through every post and filter by type (photo)
  if (postsPhotoArray == 0) {
    for (var k = 0; k < tumblr.response.posts.length; k++) {
      photosInPost = -1;  // convertir a cero el número de photos en el post
      if (tumblr.response.posts[k].type == 'photo') {
        postsPhotoArray.push(k);
      }
      for (var l = 0; l < tumblr.response.posts[k].photos.length+1; l++){
        photosInPost++;
      }
        photosInPostArray.push(photosInPost);

    }
    print('Number of posts: ' + postsPhotoArray);
    print('Number of photos in posts: ' + photosInPostArray);  // Ya tenemos el número de fotos por post
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {

    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++){
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
    }
  }

  img.style.visibility = "visible";
}

function mousePressed () {  // En el loop de abajo vamos a definir los indexes para la img

  if (postsIndex > postsPhotoArray.length-2) {
    postsIndex = -1;  // -1 para que al primer click empezemos en 0
  }
  postsIndex++;

  ask();
  print ('PostsIndex: ' + postsIndex);
  print ('PhotosIndex: '+ photosIndex);
}
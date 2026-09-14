var api_1 = "https://api.tumblr.com/v2/blog/";
var blog = "anamorphosis-and-isolate";
var api_2 = ".tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ";

var img;
var respuesta;
var time = 10;
var postsIndex = 0;   // para el loop de posts
var photosIndex = 0;  // para el loop de photos en el post

var postsPhotoArray = [];
var photoArray = [];   // AQUÍ!!  Tenemos que vaciar el array cada que loopeamos entre sus fotos e igual como hicimos con el array de posts, pasar por todas las fotos que tengan más de una foto

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
  if (postsPhotoArray < 1) {
    for (var k = 0; k < tumblr.response.posts.length; k++) {
      if (tumblr.response.posts[k].type == 'photo') {
        postsPhotoArray.push(k);
        print(postsPhotoArray);
      }
    }
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {
    photoArray = [];  // Vaciar el array en algún punto
    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++){
      photoArray.push(j);
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
    }
  }

  img.style.visibility = "visible";
}

function mousePressed () {  // Agregar el aumento en el index del array de las fotos
  if (postsIndex > postsPhotoArray.length-2) {
    postsIndex = 0;
  }
  if (photoArray.length > 1) {
    if (photosIndex > photoArray.length) {
      photosIdex = 0;
    }
    photosIndex++;
  }
  postsIndex++;
  ask();
}
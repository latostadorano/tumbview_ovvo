var api_1 = "https://api.tumblr.com/v2/blog/";
//blog = "toust";
blog = "web1995";
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
  if (postsPhotoArray.length == 0) {
    for (var k = 0; k < tumblr.response.posts.length; k++) {
      photosInPost = -1;  // convertir a cero el número de photos en el post
      if (tumblr.response.posts[k].type == 'photo') {
        postsPhotoArray.push(k);
      }
    }
    for (var i=0; i<postsPhotoArray.length; i++) {
      photosInPost = 0;
      for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
        photosInPost++;
      }
      photosInPostArray.push(photosInPost);
    }

    print('postsPhotoArray: ' + postsPhotoArray);
    print('photosInPostArray: ' + photosInPostArray);  // Ya tenemos el número de fotos por post
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {
    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++){
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
    }
  }
  img.style.visibility = "visible";
}

function mousePressed () {

  /*
  si la foto del array de fotos es > 1, photosIndex ++;
  pero si la foto del array de fotos es = 1, photosIndex = 0;

  si el index de la foto de tal post > que la cantidad de fotos en arrayDeFotos[i]{
    indexPost e indexPhoto = 0;
  }
  */

  if (postsIndex > postsPhotoArray.length-2) {
    postsIndex = -1;  // -1 para que al primer click empezemos en 0
  }
  postsIndex++;

  ask();
  print ('PostsIndex: ' + postsIndex);
  print ('PhotosIndex: '+ photosIndex);

  if (photosInPostArray[postsIndex] > 1) {
    print('Aquí hay más de una foto');

  } else {
    photosIndex = 0;
  }
}
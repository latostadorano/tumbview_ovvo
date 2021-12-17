var api_1 = "https://api.tumblr.com/v2/blog/";
blog = "toust";
//blog = "web1995";
var api_2 = ".tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ&offset=0&limit=50";

var img;
var respuesta;
var time = 10;
var postsIndex = -1; // para el loop de posts
var photosIndex = 0; // para el loop de photos en el post

var postsPhotoArray = [];
var photosInPostArray = [];
var photosInPost = 0;
var blogInput, timeInput, postButton, imgButton;
var statusFotos = false;

var randomButton = false;

function setup() {
  clear();
  blogInput = select('#blog');
  timeInput = select('#time');
  blogInput.changed(ask);
  //timeInput.changed(timeFunction);   // not yet created
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
      photosInPost = -1; // convertir a cero el número de photos en el post
      if (tumblr.response.posts[k].type == 'photo') {
        postsPhotoArray.push(k);
      }
    }
    for (var i = 0; i < postsPhotoArray.length; i++) {
      photosInPost = 0;
      for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
        photosInPost++;
      }
      photosInPostArray.push(photosInPost);
    }

    print('postsPhotoArray: ' + postsPhotoArray);
    print('photosInPostArray: ' + photosInPostArray); // Ya tenemos el número de fotos por post
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {
    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
    }
  }
  img.style.visibility = "visible";
}

function mousePressed() {

  if (randomButton) { // Mover en setup el status del botón
    randomImg();
  } else {
    var aumenta = true;
    if ((mouseX > windowWidth / 2) && (mouseX < windowWidth)) { //2da mitad - aumenta
      aumenta = true;
    } else {
      aumenta = false;
    }

    if (statusFotos) { // Si hay más de una foto:
      if (photosIndex < photosInPostArray[postsIndex] - 1) {
        if (aumenta == true) {
          photosIndex++;
        } else {
          if (photosIndex == 0) {
            postsIndex--;
            photosIndex = 0;
          } else {
            photosIndex--;
          }
        }
      } else { // Aquí voy
        photosIndex = 0;
        if (aumenta == true) {
          postsIndex++;
        } else {
          postsIndex--;
        }
      }
    } else { // Si solo hay una foto:
      if (postsIndex > postsPhotoArray.length - 2) { // si el postIndex es mayor a los post de foto que existen
        postsIndex = 0;
      } else {
        if (aumenta == true) {
          postsIndex++;
        } else {
          if (postsIndex == 0) {
            postsIndex = postsPhotoArray.length - 2;
          } else {
            postsIndex--;
          }
        }
      }
    }
    if (photosInPostArray[postsIndex] > 1) {
      print('Aquí hay más de una foto');
      statusFotos = true;
    } else {
      statusFotos = false;
    }
  }
  ask();

  print('PostsIndex: ' + postsIndex);
  print('PhotosIndex: ' + photosIndex);
}

// Usar el botón de back
// Checar que sí salgan todas las fotos
// Que en el random no se repitan las fotos
function randomImg() {
  postsIndex = floor(random(postsPhotoArray.length));
  if (photosInPostArray[postsIndex] > 1) {
    photosIndex = floor(random(photosInPostArray[postsIndex]));
  } else {
    photosIndex = 0;
  }
}
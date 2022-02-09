var offset = 0;
var limit = offset + 50;
var api_1 = "https://api.tumblr.com/v2/blog/";
//blog = "love";
blog = "nevver";
var api_2 = ".tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ&offset=" + offset * 50 + "&limit=" + limit;

var img;
var respuesta;

var postsIndex = 0; // para el loop de posts
var photosIndex = 0; // para el loop de photos en el post

var postsPhotoArray = [];
var photosInPostArray = [];
var totalPhotos = 0;
var totalPhotosRemaining;
var noMorePhotosLeft = false;
var stopTimer = true;
var photosInPost = 0;
var blogInput, timeInput, postButton, imgButton;
var statusFotos = false;

var randomButton = true;
let lastRandom = 0;
var lastRandomArray = [];
var lastRandomIndex = 0;

var timeImg = 10; //secs the img will be on display
let lastTimeImg = 0;
let timeSettings = 10;  // secs Setting will be on display
let lastTimeSettings = 0;


function setup() {
  clear();
  ripTumbview = createP('RIP Tumbview - Play a slideshow for a tumblr blog.')
  ripTumbview.position(20,20);
  blogInput = createInput('Tumblr name');
  blogInput.position(20,65);
  blogInput.changed(changeBlog);

  timeInput = createInput('Seconds');
  timeInput.position(175,65);
  timeInput.changed(changeTime);

  img = document.getElementById("foto");

  playButton = createButton('Go') //⏸
  playButton.position(360,65);
  playButton.mousePressed(start);

  //makeTimer(time);
  //setInterval(timeFunction, time * 1000); // Necesitamos que time se actualice aquí
}

function draw() {
  if (millis()-lastTimeSettings > timeSettings * 1000){
    ripTumbview.style('visibility', 'hidden');
    blogInput.style('visibility', 'hidden');
    timeInput.style('visibility', 'hidden');
    playButton.style('visibility', 'hidden');
    noCursor();
  }
}

function mouseMoved() {
  displayVisible();
}

function displayVisible(){
  ripTumbview.style('visibility', 'visible');
  blogInput.style('visibility', 'visible');
  timeInput.style('visibility', 'visible');
  playButton.style('visibility', 'visible');
  cursor(ARROW);

  lastTimeSettings = millis();
}

function start() {
  ask();
  playButton.html('⏸');
  playButton.mousePressed(togglePlaying);
}

function makeTimer() {
  var wait = timeInput.value();
  setInterval(timeFunction, wait * 1000); // eliminar esto y hacer un timer
}

function changeBlog() {
  blog = blogInput.value();
  api_1 = "https://api.tumblr.com/v2/blog/";
  ask();
}

function changeTime() {
  time = timeInput.value();
  makeTimer(time);
}

function timeFunction() {
  if (stopTimer == false) {
    print("--- TIMER ---");
    print("Timer = " + time);
    ask();
  }
}

function togglePlaying() {
  if (stopTimer == false) {
    stopTimer = true;
    print('Timer stopped.');
    playButton.html('▶️');
  } else {
    stopTimer = false;
    print('Timer start.');
    playButton.html('⏸');
  }
}

function keyPressed() {
  displayVisible();
  if (keyCode === 32) {
    ask();
  }
}

function ask() {
  randomImg();

  var url = api_1 + blog + api_2;
  loadJSON(url, gotData);
  print('Offset: ' + offset);
  print('Photos remaining: ' + totalPhotosRemaining);
}

function randomImg() {
  if (noMorePhotosLeft == false) {
    postsIndex = floor(random(postsPhotoArray.length));
    //print("PostsIndex = " + postsIndex);

    if (totalPhotosRemaining <= 0) {
      print('There are no photos left!!!!!!!');
      offset++;
      newData();
      /* noMorePhotosLeft = true;
      return; */
    }

    if (lastRandomArray.includes(postsIndex)) {

      if (photosInPostArray[postsIndex] == 1) {
        //print("Repeat!!!");
        randomImg();
      } else { // if hay más de una foto
        //print('✨ More than one foto! Photos in post: ' + photosInPostArray[postsIndex]);
        photosIndex = floor(random(1, photosInPostArray[postsIndex]));
        //print('-- Photos index: ' + photosIndex);
        photosInPostArray[postsIndex]--;

        totalPhotosRemaining--;
        //print("lastRandomArray: " + lastRandomArray);
        //print('Photos remaining: ' + totalPhotosRemaining);
      }

    } else if (lastRandomArray.includes(postsIndex) == false) {
      append(lastRandomArray, postsIndex);
      lastRandomIndex++;
      photosIndex = 0;

      totalPhotosRemaining--;
      //print("lastRandomArray: " + lastRandomArray);
      //print('Photos remaining: ' + totalPhotosRemaining);
    }

  }

}

function gotData(tumblr) {
  // Si el array está vacío (aka: acabamos de cambiar de blog)
  // Loop through every post and filter by type (photo)
  if (postsPhotoArray.length == 0) {
    photosInPost = 0;
    for (var k = 0; k < tumblr.response.posts.length; k++) {
      // convertir a cero el número de photos en el post
      if (tumblr.response.posts[k].type == 'photo') {
        postsPhotoArray.push(k);
      }
    }
    for (var i = 0; i < postsPhotoArray.length; i++) {
      photosInPost = 0;
      for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
        photosInPost++;
        totalPhotos++;
      }
      photosInPostArray.push(photosInPost);
    }
    print('Blogname= ' + blog.toUpperCase());
    print('Total photos: ' + totalPhotos);
    totalPhotosRemaining = totalPhotos - 1;
    print('*** PostsPhotoArray: ' + postsPhotoArray);
    print('*** PhotosInPostArray: ' + photosInPostArray); // Ya tenemos el número de fotos por post
    print('Photos remaining: ' + totalPhotosRemaining);
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {
    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
    }
  }
  img.style.visibility = "visible";
  noMorePhotosLeft = false;
}

function newData() {
  api_2 = ".tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ&offset=" + offset * 50 + "&limit=" + limit;
  //print(api_2);
  postsIndex = 0; // para el loop de posts
  photosIndex = 0; // para el loop de photos en el post

  postsPhotoArray = [];
  photosInPostArray = [];
  totalPhotos = 0;
  photosInPost = 0;
  lastRandom = 0;
  lastRandomArray = [];
  lastRandomIndex = 0;

}

/* function mousePressed() {
  var aumenta = true;
  if ((mouseX > windowWidth / 2) && (mouseX < windowWidth)) { //2da mitad - aumenta
    aumenta = true;
  } else {
    aumenta = false;
  }

  if (randomButton) { // Mover en setup el status del botón
    if (aumenta == true) {
      randomImg();
    } else {
      lastRandomIndex--;
      postsIndex = lastRandomArray[lastRandomIndex];
    }

  } else {
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

  // print('PostsIndex: ' + postsIndex);
  // print('PhotosIndex: ' + photosIndex);
} */

// Back button

/* function mousePressed() {
  stopTimer = !stopTimer; // toggle a boolean
  print('stopTimer is ' + stopTimer);
} */
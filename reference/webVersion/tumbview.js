var offset = 0;
var limit = offset + 50;
var api_1 = "https://api.tumblr.com/v2/blog/";
//blog = "love";
blog = "toust";
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
var blogInput, timeInput, playButton, goButton, tumblrLink;
var statusFotos = false;

var randomButton = true;
let lastRandom = 0;
var lastRandomArray = [];
var lastRandomIndex = 0;

var timeImg = 8; //secs the img will be on display
let lastTimeImg = 0;
let timeSettings = 15; // secs Setting will be on display
let lastTimeSettings = 0;

let playVisibility = false;
let goVisibility = true;

let start = false;


function setup() {
  clear();
  ripTumbview = createP('RIP Tumbview - Play a slideshow for a tumblr blog.')
  ripTumbview.position(20, 20);
  blogInput = createInput('Tumblr name');
  blogInput.position(20, 65);
  blogInput.changed(changeBlog);

  timeInput = createInput('Seconds');
  timeInput.position(200, 65);
  timeInput.changed(changeTime);

  img = document.getElementById("foto");

  goButton = createButton('Go');
  goButton.position(385, 65);
  goButton.mousePressed(startFun);

  playButton = createButton('▶️') //⏸
  playButton.style('visibility', 'hidden');
  playButton.position(427, 65);
  playButton.mousePressed(togglePlaying);

  tumblrLink = createButton('🔗');
  tumblrLink.style('visibility', 'hidden');
  tumblrLink.position(469, 65);
  tumblrLink.mousePressed(tumblrImg);

}

function startFun() {
  ask();
  togglePlaying();
  start = true;
  playVisibility = true;
  goVisibility = false;
}

function draw() {
  if (start == true) {

    if (millis() - lastTimeSettings > timeSettings * 1000) { // displayed info on screen
      ripTumbview.style('visibility', 'hidden');
      blogInput.style('visibility', 'hidden');
      timeInput.style('visibility', 'hidden');
      playButton.style('visibility', 'hidden');
      goButton.style('visibility', 'hidden');
      tumblrLink.style('visibility', 'hidden');
      noCursor();
    }
    if (millis() - lastTimeImg > timeImg * 1000) { // timer between imgs
      ask();
    }
    //playButton.mousePressed(togglePlaying);
    if (stopTimer == true) {
      lastTimeImg = millis();
    }
  }

}

function tumblrImg() {
  window.open(img.tumblr_link);
}

function webImg() {
  window.open(img.img_link);
}

function mouseMoved() {
  displayVisible();
}

function displayVisible() {
  ripTumbview.style('visibility', 'visible');
  blogInput.style('visibility', 'visible');
  timeInput.style('visibility', 'visible');
  if (playVisibility == true) {
    playButton.style('visibility', 'visible');
    tumblrLink.style('visibility', 'visible');

  } else {
    playButton.style('visibility', 'hidden');
    tumblrLink.style('visibility', 'hidden');

  }

  if (goVisibility == true) {
    goButton.style('visibility', 'visible');
  } else {
    goButton.style('visibility', 'hidden');
  }

  lastTimeSettings = millis();
}

/* function start() {
  ask();
  playButton.mousePressed(togglePlaying);
} */


function changeBlog() {
  newData();
  blog = blogInput.value();
  api_1 = "https://api.tumblr.com/v2/blog/";
  goVisibility = true;

  //ask();
}

function changeTime() {
  timeImg = timeInput.value();
}

function timeFunction() {
  if (stopTimer == false) {
    print("--- TIMER ---");
    print("Timer = " + time);
    //ask();
  } else {
    //lastTimeSettings = millis();   // Apagar el tiempo!!!
    print("Timer off")
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
    ask();
  }
}

function keyPressed() {
  displayVisible();
  if (keyCode === 32 || keyCode === 39) { // spacebar and right arrow
    ask();
  }
}

function mousePressed() {
  if (mouseX < windowWidth) {
    ask();
  }
  //ask();
}

function ask() {
  randomImg();

  api_1 = "https://api.tumblr.com/v2/blog/";
  var url = api_1 + blog + api_2;
  loadJSON(url, gotData);


  print('Time: ' + timeImg);
  print('Photos remaining: ' + totalPhotosRemaining);
  lastTimeImg = millis();
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
        print('✨ More than one foto! Photos in post: ' + photosInPostArray[postsIndex]);
        photosIndex = floor(random(1, photosInPostArray[postsIndex]));
        print('-- Photos index: ' + photosIndex);
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
    print('Offset: ' + offset);
    print('Total photos: ' + totalPhotos);
    totalPhotosRemaining = totalPhotos - 1;
    print('*** PostsPhotoArray: ' + postsPhotoArray);
    print('*** PhotosInPostArray: ' + photosInPostArray); // Ya tenemos el número de fotos por post
    print('Photos remaining: ' + totalPhotosRemaining);
  }

  for (var i = 0; i < postsPhotoArray.length; i++) {
    for (var j = 0; j < tumblr.response.posts[postsPhotoArray[i]].photos.length; j++) {
      img.src = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
      img.tumblr_link = (tumblr.response.posts[postsPhotoArray[postsIndex]].post_url);
      img.img_link = (tumblr.response.posts[postsPhotoArray[postsIndex]].photos[photosIndex].original_size.url);
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
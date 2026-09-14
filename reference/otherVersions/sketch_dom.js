var api_1 = "https://api.tumblr.com/v2/blog/toust.tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ";

function setup() {
  noCanvas();
  var url = api_1;
  loadJSON(url, gotData);
}

function gotData(tumblr) {
  // Loop through every post and filter by type (photo)
  for (var i = 0; i < tumblr.response.posts.length; i++) {
    if (tumblr.response.posts[i].type == 'photo') {
      for (var j = 0; j < tumblr.response.posts[i].photos.length; j++){
        createImg(tumblr.response.posts[i].photos[j].original_size.url);
      }
    }
  }
}
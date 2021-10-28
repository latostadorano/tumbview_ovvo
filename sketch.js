var api_1 = "https://api.tumblr.com/v2/blog/toust.tumblr.com/posts/photo?api_key=UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ";

function setup() {
  noCanvas();
  var url = api_1;
  loadJSON(url, gotData);
}

function gotData(tumblr) {
  for (var i = 0; i < tumblr.response.posts.length; i++) {
    // print(tumblr.response.posts[i].type)
    if (tumblr.response.posts.type == 'text') {
      print("It's a text post");
      //createImg(tumblr.response.posts[i].photos[0].original_size.url);
    } else if (tumblr.response.posts.type == 'photo') {
      print ("It's a photo post");
    }
  }
}
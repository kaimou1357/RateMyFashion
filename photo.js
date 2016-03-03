/** Photo Model**/

var Photo = function Photo(file_url, positive_ratings, negative_ratings, object_id ){
  this.file_url = file_url;
  this.positive_ratings = positive_ratings;
  this.negative_ratings = negative_ratings;
  this.object_id = object_id;
}

module.exports = Photo;

/* global math */
var Suggestion = (function(module) {
  // Random number generator with seed
  var seed = 1;
  function random() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  }

  var setSeed = function(x) {
    seed = x;
  };

  var makeMatrix = function() {
    var seed = $('#random_seed').val() - 0;
    var rated_movies = $('#rated_movies').val() - 0;
    var unrated_movies = $('#unrated_movies').val() - 0;
    setSeed(seed);

    // Make similarity matrix(depend on seed)
    // Row: Rated movie, Col: Unrated movie
    var m1 = math.map(math.zeros(rated_movies,unrated_movies),function(value) {
        return random();
    });

    return m1.valueOf();
  };

  var makeRatingTable = function(target, data) {
    var user_count = $('#user_count').val() - 0;
    var rated_movies = $('#rated_movies').val() - 0;

    target.empty();

    var head = $("<thead>");
    var header_row = $("<tr>")

    header_row.append("<th>User</th>");

    for(var i=0; i<rated_movies; i++) {
      header_row.append("<th>M"+(i+1)+"</th>");
    }

    head.append(header_row);

    var body = $("<tbody>")
    for(var i=0; i<user_count; i++) {
      var row = $("<tr>");
      row.append("<th>U"+(i+1)+"</th>")

      for(var j=0; j<rated_movies; j++) {
        var rating;
        try {
          rating = data[i][j] || 0;
        } catch(err) {
          rating = 0;
        }
        row.append("<td><input type='text' value='"+rating+"'/></td>");
      }

      body.append(row);
    }

    target.append(head).append(body);
  };

  var makeSimilarityTable = function(target, data) {
    var rated_movies = $('#rated_movies').val() - 0;
    var unrated_movies = $('#unrated_movies').val() - 0;

    target.empty();

    var head = $("<thead>");
    var header_row = $("<tr>")

    header_row.append("<th>Movie</th>");

    for(var i=0; i<unrated_movies; i++) {
      header_row.append("<th>M"+(i+rated_movies+1)+"</th>");
    }

    head.append(header_row);

    var body = $("<tbody>")
    for(var i=0; i<rated_movies; i++) {
      var row = $("<tr>");
      row.append("<th>M"+(i+1)+"</th>")

      for(var j=0; j<unrated_movies; j++) {
        var similarity = data[i][j];
        row.append("<td><input type='text' value='"+similarity+"'/></td>");
      }

      body.append(row);
    }

    target.append(head).append(body);
  };

  var extractMatrix = function(target) {
    var data = [];

    $(target).find("tbody")
      .find("tr").each(function(i,d) {
        var row = [];
        $(d).find("input").each(function(i, d) {
          row.push($(d).val()-0);
        });
        data.push(row);
      });

    return data;
  }

  var makeSuggestionMatrix = function(user_count, ratings, sim_table, suggestion_count) {
    var user_friendly = math.zeros(user_count, sim_table[0].length).valueOf();

    for(var userIdx=0; userIdx<user_count; userIdx++) {
      for(var ratedMovieIdx=0; ratedMovieIdx<ratings[userIdx].length; ratedMovieIdx++) {
        var rating = ratings[userIdx][ratedMovieIdx];
        var scores = sim_table[ratedMovieIdx].map(function(d) { return d * rating; });

        user_friendly[userIdx] = _.zipWith(user_friendly[userIdx], scores, _.add);
      }
    }

    var users = [];
    for(var userIdx=0; userIdx<user_count; userIdx++) {
      var highestScore = _(user_friendly[userIdx]).sortBy().takeRight(suggestion_count).reverse().value();
      var movies = highestScore.map(function(score) {
        return [_(user_friendly[userIdx]).indexOf(score), score];
      });

      users.push(movies);
    }

    return users;
  };

  //////////////////////////////////
  // Event listeners
  //////////////////////////////////
  module.suggestion = function() {
    var target = $("#movie_suggestion_table tbody");
    var user_count = $('#user_count').val() - 0;
    var ratings = extractMatrix($("#movie_rating_table"));
    var sim_table = extractMatrix($("#movie_similarity_table"));
    var suggestion_count = $("#suggestion_count").val() - 0;

    var m2 = makeSuggestionMatrix(user_count, ratings, sim_table, suggestion_count);

    var rated_movies = $('#rated_movies').val() - 0;

    target.empty();

    m2.map(function(user, userIdx) {
      var row = $("<tr>");
      row.append($("<td>U"+(userIdx+1)+"</td>"))
      var col = $("<td>");
      user.map(function(movies) {
        col.append("<span>M"+(movies[0]+rated_movies+1)+"("+parseInt(movies[1]*1000)+") </span>");
      });
      row.append(col);
      target.append(row);
    });
  };

  module.update = function() {
    var backup1 = extractMatrix($("#movie_rating_table"));
    var m1 = makeMatrix();
    makeRatingTable($("#movie_rating_table"), backup1);
    makeSimilarityTable($("#movie_similarity_table"), m1);
  };

  return module;

})(this);
/* global math */
'use strict';

function load_sample() {
  $.getJSON("beginagain.json", function(data) {
    // Split daily and weekly
    window.all_range = data;
    window.daily = _(data).groupBy(function(d) { return parseInt(d.time / (86400)); }).values().value();
    window.weekly = _(data).groupBy(function(d) { return parseInt(d.time / (86400 * 7)); }).values().value();

    $(document).trigger("data_loaded");
  });
}

$(document).on('data_loaded', function() {
  update_tweets_frequency();
});

function update_tweets_frequency() {
  var dates = _.map(window.daily, function(d) { return new Date(d[0].time * 1000); });
  var tws1 = _.map(window.daily, function(d) { return [d[0].time * 1000, d.length]; });
  var tws2 = _.map(window.weekly, function(d) { return [d[0].time * 1000, d.length]; });


  $("#tweets-frequency").highcharts({
    chart: {
      type: 'spline',
      zoomType: 'x'
    },
    title: "Tweets frequency",
    xAxis: {
      type: 'date',
      labels: {
        format:"{value:%Y-%m-%d}"
      },
      categories: dates,
      title: { text: null }
    },
    yAxis: {

    },
    legend: {
      layout: 'horizontal',
      align: 'top',
      verticalAlign: 'top',
      borderWidth: 0
    },
    series: [{
      name: 'Daily Tweets',
      data: tws1
    },{
      name: 'Weekly Tweets',
      data: tws2
    }]
  });
}

function word_count(tws, top_n) {
  var words = {};

  function counter(a) {
    words[a] = words[a] ? words[a]+1 : 1;
  }

  for(var i in tws) {
    _.each(tws[i].text.toLowerCase().split(/[,.!@#$%^&*\n ]/), counter);
  }

  return _(words)
    .pairs()
    .sortBy(function(n) {return n[1];})
    .reverse()
    .drop(1)   // Rank 1 is always empty string
    .take(top_n)
    .value();
}

function first_appear(tws, word) {
  return _.find(tws, function(tw) {
    if(_.isString(tw.text) && _.isString(word)) {
      return _.includes(tw.text.toLowerCase(), word.toLowerCase());
    } else {
      return false;
    }
  });
}


function word_appear_tweet_count(tws, word) {
  return _.filter(tws, function(tw) {
    return _.includes(tw.text.toLowerCase(), word.toLowerCase());
  }).length;
}







function all_range_word_appears() {
  var target = $("#all_range_word_appears");

  var words = word_count(window.all_range, 500);
  var rank = 0;

  _.each(words, function(w) {
    rank = rank + 1;
    var tw_f = first_appear(window.all_range, w[0]);
    var appear = "-";
    if(tw_f) {
      appear = new Date(tw_f.time * 1000).toISOString().split("T")[0];
    }

    $("<tr><td>"+rank+"</td><td>"+w[0]+"</td><td data-dateformat='YYYY-MM-DD'>"+appear+"</td><td>"+w[1]+"</td></tr>")
      .appendTo(target);
  });

  $.bootstrapSortable(true);
}


///////////////////////////////////////////////////////////////////
// CHARACTERS TAB
///////////////////////////////////////////////////////////////////
var characters_tab = (function(module) {
  var self = {};

  self.update = function() {
    build_character_group();

    var doc1 = window.script1.getValue();
    var doc2 = window.script2.getValue();

    var script1 = parseScript(doc1);
    build_character_list_ui(script1, $("#all_characters1"));

    var script2 = parseScript(doc2);
    build_character_list_ui(script2, $("#all_characters2"));

    module.parsedScript1 = script1;

    console.log(script1);
    module.parsedScript2 = script2;
  };

  var build_character_list_ui = function(parsed_script, elem) {
    $(elem).empty();
    var main = parsed_script.main;
    var sub = parsed_script.sub;
    var extra = parsed_script.extra;
    var ld = function(name) {
      return _.filter(parsed_script.listen_degree, function(n) { return n[0] == name; })[0];
    }

    $.each(main, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-primary' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });

    $.each(sub, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-success' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });

    $.each(extra, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-default' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });

    $('[data-toggle="tooltip"]').tooltip();
  };

  var build_character_group = function() {
    // Store last value in the localstorage
    window.localStorage.setItem("character_group", $("#character_group_def").val());

    var groups = $("#character_group_def").val().split(",");

    // Remove all
    var target = $("#character_groups1,#character_groups2").empty();

    _.each(groups, function(group) {
      $("<label class='col-xs-6'>"+group+" <input type='text' class='character_group'></label>").appendTo(target);
    });

    // Restore backup
    var backup1 = (""+window.localStorage.getItem("character_groups1_character_group")).split("|");
    var backup2 = (""+window.localStorage.getItem("character_groups2_character_group")).split("|");

    _.each(groups, function(group, index) {
      $("#character_groups1 .character_group:nth("+index+")").val(backup1[index]);
      $("#character_groups2 .character_group:nth("+index+")").val(backup2[index]);
    });

  };

  /**
   * Parse Script
   *
   * return object schema: {
   *   all_characters[]: Character names sorted by talking length
   *   listen_degree[]: Listen degree for each character
   *   listen_matrix[][]: Talk-Listen matrix
   *   main: main characters
   *   sub: sub characters
   *   extra: extra characters
   * }
   *
   * @param {Object} doc Codemirror Document
   * @return {Object} parsed information
   */
  var parseScript = function(doc) {
    var result = {};
    var scenes = [];

    var lines = doc.split('\n');

    var cur_scene = new Scene('');
    var cur_character = 'NONAME';

    // Step 1: Extract dialog character
    $.each(lines, function(i, e) {
      if(e.match(/^INT\.|EXT\.|INT\/EXT\./)) {
        scenes.push(cur_scene);
        cur_scene = new Scene(e);
      } else {
        var indent = e.match(/^\s*/)[0].length;

        // Character
        if(indent >= 20 && indent <= 24) {
          cur_character = e.match(/^\s*([a-zA-Z0-9 .]+)/)[1];
          cur_scene.add_character(cur_character.trim());
        }

        // Dialog
        if(indent >= 10 && indent <= 12) {
          var dialog_len = e.match(/^\s*(.*)$/)[1].length;
          cur_scene.dialogs[cur_character] += dialog_len;
        }

        // Action
        if(indent >= 0 && indent <= 4) {
          cur_scene.action_script += e.trim() + " ";
        }

      }
    });

    // Step 2: Extract additional character in action tag
    var all_chars = _(scenes).map(function(scene) { return scene.characters; })
                             .flatten().uniq().value();


    $.each(scenes, function(i, scene) {
      $.each(all_chars, function(j, character) {
        if(scene.action_script.toUpperCase().indexOf(character) != -1) {
          scene.add_character(character.trim());
        }
      });

      delete scene.action_script;
    });

    // Step 3: Make listen matrix
    var listen_matrix = math.zeros(all_chars.length, all_chars.length).valueOf();
    $.each(scenes, function(i, scene) {

      $.each(scene.characters, function(i, teller) {
        var teller_index = _.indexOf(all_chars, teller);
        if(teller_index != -1) {
          $.each(scene.characters, function(i, listener) {
            var listener_index = _.indexOf(all_chars, listener);
            listen_matrix[teller_index][listener_index] += scene.dialogs[teller];
          });
        }
      });
    });

    // Step 4: Character sort by listen degree
    var listen_degree = math.zeros(all_chars.length).valueOf();
    for(var i=0; i<all_chars.length; i++) {
      for(var j=0; j<all_chars.length; j++) {
        listen_degree[i] += listen_matrix[i][j];
      }
    }

    listen_degree = _.zip(all_chars, listen_degree);
    listen_degree = _.sortBy(listen_degree, function(n) { return n[1]; }).reverse();

    result.listen_degree = listen_degree;

    // Step 5: Re-adjust all_characters(Degree order)
    all_chars = _.map(listen_degree, function(n) { return n[0]; });

    $.each(scenes, function(i, scene) {

      $.each(scene.characters, function(i, teller) {
        var teller_index = _.indexOf(all_chars, teller);
        if(teller_index != -1) {
          $.each(scene.characters, function(i, listener) {
            var listener_index = _.indexOf(all_chars, listener);
            listen_matrix[teller_index][listener_index] += scene.dialogs[teller];
          });
        }
      });
    });

    result.listen_matrix = listen_matrix;

    console.log(scenes);
    console.log(listen_matrix);

    result.all_characters = all_chars;


    // Step 6: Make character groups
    var degrees1 = _.map(listen_degree, function(n) { return n[1]; });
    var degrees2 = _.map(listen_degree, function(n) { return -n[1]; });

    degrees1.unshift(0);
    degrees2.push(0);

    var delta = _(degrees1).zipWith(degrees2, _.add).map(Math.abs).value();
    delta[0] = 0;

    degrees1.shift();

    var maxDeltaPosition = _.indexOf(delta, math.max(delta)) + 1;
    var avgDeltaPosition = _.takeWhile(degrees1, function(n) { return n >= math.mean(degrees1); }).length;

    result.main = _.slice(all_chars, 0, maxDeltaPosition);
    result.sub = _.slice(all_chars, maxDeltaPosition, avgDeltaPosition);
    result.extra = _.slice(all_chars, avgDeltaPosition, all_chars.length);

    return result;
  };

  return self;
})(module);



///////////////////////////////////////////////////////////////////
// MATRIX TAB
///////////////////////////////////////////////////////////////////
var matrix_tab = (function(module) {
  var self = {};

  // Utility
  var heat1 = function(heat) {
    var contrast = $("#contrast").val() - 0;
    var value = math.min(255, parseInt(heat * contrast));
    return "rgba("+value+",0,0,255)";
  };

  var heat2 = function(heat) {
    var contrast = $("#contrast").val() - 0;
    var value = math.min(255, parseInt(heat * contrast));
    return "rgba(0,0,"+value+",255)";
  };

  var heat3 = function(heat) {
    var contrast = $("#contrast").val() - 0;
    var value = math.min(255, parseInt(heat * contrast));
    return "rgba(0,"+value+","+value+",255)";
  };

  // Step 1: make groups
  var make_groups = function(elem) {
    var scriptGroup = [];
    elem.find(".character_group").each(function(i) {
      scriptGroup.push(_.map($(this).val().toUpperCase().split(","), function(name) { return name.trim(); }));
    });

    return scriptGroup;
  };

  // Step 2: build matrix UI
  var build_table_ui = function(target, groupNames) {
    target.empty();
    var head = $("<thead>");
    var header_row = $("<tr>");

    header_row.append("<th>*</th>");

    _.each(groupNames, function(groupName) {
      header_row.append("<th>"+groupName+"</th>")
    });

    head.append(header_row);

    var body = $("<tbody>");
    var length = groupNames.length;
    _.each(groupNames, function(groupName) {
      var row = $("<tr>");
      row.append("<th>"+groupName+"</th>")

      for(var i=0; i<length; i++) {
        row.append("<td></td>");
      }

      body.append(row);
    });

    target.append(head).append(body);
  }

  // Step 3: make matrix content
  /**
   * Make matrix
   *
   * @param {Integer} matrix size
   * @param {Array} listen matrix(2 dimentional array)
   * @param {Array} character type group
   *
   * @return {Array} character heat-map matrix(2d)
   */
  var make_matrix = function(matrix_size, parsedScript, groups) {
    var matrix = math.zeros(matrix_size, matrix_size).valueOf();
    var listen_matrix = parsedScript.listen_matrix;
    var all_chars = parsedScript.all_characters;

    for(var i=0; i<matrix_size; i++) {
      for(var j=0; j<matrix_size; j++) {
        _.each(groups[i], function(teller) {
          var teller_index = all_chars.indexOf(teller);
          if(teller_index >= 0) {
            _.each(groups[j], function(listener) {
              var listener_index = all_chars.indexOf(listener);
              if(listener_index >= 0) {
                matrix[i][j] += listen_matrix[teller_index][listener_index];
              }
            });
          }
        });
      }
    }

    var total_degree = math.sum(matrix);
    var normalized_matrix = math.multiply(matrix, 1/total_degree).valueOf();

    return normalized_matrix;
  };

  // Step 4: Insert matrix values to Matrix UI
  var fill_matrix = function(elem, matrix, heatcolor) {
    var matrix_size = matrix.length;

    for(var i=0; i<matrix_size; i++) {
      for(var j=0; j<matrix_size; j++) {
        $(elem).find("tbody tr:nth("+(i)+") td:nth("+(j)+")")
          .css("background-color",heatcolor(matrix[i][j]))
          .text((matrix[i][j]*100).toFixed(1));
      }
    }
  };

  self.update = function() {
    // Backup last data
    var backup1 = [];
    var backup2 = [];

    $("#character_groups1 .character_group").each(function(i) { backup1.push($(this).val()); });
    $("#character_groups2 .character_group").each(function(i) { backup2.push($(this).val()); });

    window.localStorage.setItem("character_groups1_character_group", backup1.join("|"));
    window.localStorage.setItem("character_groups2_character_group", backup2.join("|"));

    var groupNames = $("#character_group_def").val().split(",");
    var groups1 = make_groups($("#character_groups1"));
    var groups2 = make_groups($("#character_groups2"));

    var matrix1 = $("#character_matrix1");
    var matrix2 = $("#character_matrix2");
    var matrix_diff = $("#character_difference_matrix");

    build_table_ui(matrix1, groupNames);
    build_table_ui(matrix2, groupNames);
    build_table_ui(matrix_diff, groupNames);

    var matrix_size = groupNames.length;

    var heatmap1 = make_matrix(matrix_size, module.parsedScript1, groups1);
    var heatmap2 = make_matrix(matrix_size, module.parsedScript2, groups2);
    var heatmap3 = math.subtract(math.matrix(heatmap1), math.matrix(heatmap2))
                       .map(function(value, index, matrix) { return math.abs(value); })
                       .valueOf();

    fill_matrix(matrix1, heatmap1, heat1);
    fill_matrix(matrix2, heatmap2, heat2);
    fill_matrix(matrix_diff, heatmap3, heat3);

    var matrix_similarity = 1-(math.sum(heatmap3)/2);
    $("#matrix_similarity").text((matrix_similarity*100).toFixed(3) + "%");
  };

  return self;
})(module);

/* global math */
'use strict';

function all_range_run() {
  all_range_word_appears();

  var wordList = _.map(word_count(window.all_range, 500), function(d) { return [d[0], d[1]/10]; });

  WordCloud($('#word_cloud1')[0], {
    list: wordList,
    minSize: 5,
    clearCanvas:true
  });
}

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





function weekly_run() {
  weekly_tab_update();
}

function weekly_tab_update() {
  var search = $("#weekly_search_word").val();

  var dates = _.map(window.weekly, function(d) { return new Date(d[0].time * 1000); });
  var all_tws = _.map(window.weekly, function(d) { return [d[0].time * 1000, d.length]; });
  var tws = _.map(window.weekly, function(tw) {
    return [tw[0].time * 1000, word_appear_tweet_count(tw, search)];
  });

  $("#weekly-tweets-frequency").highcharts({
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
    yAxis: [{
      title: null
    },{
      title: null
    }],
    legend: {
      layout: 'horizontal',
      align: 'top',
      verticalAlign: 'top',
      borderWidth: 0
    },
    series: [{
      name: 'All tweets',
      data: all_tws,
      yAxis:0
    },{
      name: search,
      data: tws,
      yAxis:1
    }]
  });

}






function neighbor_run() {
  var source = window.all_range;
  var search = $("#neighbor_search_word").val().toLowerCase();

  var filtered = _.filter(source, function(tw) {
    return _.contains(tw.text.toLowerCase(), search);
  });

  var words = {};

  _.each(filtered, function(tw) {
    var arr = tw.text.toLowerCase().split(/[,.!@#$%^&*\n ]/);
    var index = _.indexOf(arr, search);

    for(var i=-20; i<=20; i++) {
      var w = arr[index+i];

      if(w && i != 0) {
        words[w] = (words[w] || 0) + (1/(i*i));
      }
    }
  });

  var result = _(words)
    .pairs()
    .sortBy(function(n) {return n[1];})
    .reverse()
    .take(20)
    .value();

  $("#words-neighbor").highcharts({
    chart: {
      type: 'bar',
      zoomType: 'x'
    },
    title: "Neighbor words",
    xAxis: {
      categories: _.map(result, function(n) { return n[0]; }),
      title: { text: null }
    },
    yAxis: {

    },
    legend: {
      enabled: false
    },
    series: [{
      data: result
    }]
  });
}

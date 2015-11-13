var $ = require('jquery');
var fs = require('fs');

if(process.argv.length != 3) {
	console.error("Usage: node parseraw.js [raw_html]");
	process.exit();
}

function parse(err, data) {
	var tweets = $(data).find("div.tweet");
	var tweetsObj = [];

	tweets.each(function() {
		var tweet = $(this);
		var obj = {
			userId: tweet.attr('data-user-id'),
			userName: tweet.attr('data-name'),
			screenName: tweet.attr('data-screen-name'),
			tweetId: tweet.attr('data-tweet-id'),
			text: tweet.find('.tweet-text').first().text(),
			time: tweet.find("._timestamp").first().attr("data-time"),
			time_in_str: tweet.find(".tweet-timestamp").first().attr("title")
		};

		tweetsObj.push(obj);
	});

	console.log(JSON.stringify(tweetsObj));
}

fs.readFile(process.argv[2], 'UTF-8', parse);


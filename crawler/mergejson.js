var lodash = require('lodash');
var fs = require('fs');

if(process.argv.length < 3) {
	console.error("Usage: node mergejson.js [json...]");
	process.exit();
}

var merged = [];

// Linear concat json files
for(var i=2; i<process.argv.length; i++) {
	content = fs.readFileSync(process.argv[i], 'UTF-8');
	var json = JSON.parse(content);

	merged = merged.concat(json);
}

// Remove duplicate
var deduped = lodash.uniq(merged, function(tweet) { return tweet.tweetId; });

console.log(JSON.stringify(deduped));

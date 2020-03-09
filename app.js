const irc = require('irc');
const request = require('request');
const async = require('async');

const config = require('./config.js');

const bot = new irc.Client(config.irc.server, config.irc.nick, config.irc);

function go(bot, to, all) {
	bot.say(to, "Adding players with delay of " + config.ADD_DELAY + " ms");
	request(config.NP_URL, function (err, res, body) {
		if (err) {
			console.log("Error downloading file: " + err);
		} else {
			const players = body.split(/\r?\n/);
			async.eachSeries(players, (player, callback) => {
				if (player[0] == config.COMMENT_CHAR)
					return callback();

				const command = config.COMMAND_PREFIX + player;

				if (all) {
					const chans = Object.keys(bot.chans);
					chans.forEach(chan => {
						bot.say(chan, command);
					});
				} else {
					bot.say(to, command);
				}
				setTimeout(callback, config.ADD_DELAY);
			}, (err) => {
				if (err) {
					return console.log(err);
				}
				bot.say(to, "All done...");
				console.log("Done");
			});
		}
	});
}

bot.addListener('message', (from, to, message) => {
	if (!config.ADMINS.includes(from)) return;
	if (to.match(/^[#&]/)) {
		// channel message
		if (message.match(/^!goall/i)) {
			go(bot, to, true);
		} else if (message.match(/^!go/i)) {
			go(bot, to, false);
		} else if (message.match(/^!j/i)) {
			const chan = message.split(" ")[1];
			if (chan) {
				bot.join(chan);
				bot.say(to, "Joining " + chan);
			} else {
				bot.say(to, "Error joining channel: invalid");
			}
		} else if (message.match(/^!say/i) || message.match(/^!echo/i)) {
			const say = message.substr(message.indexOf(' ')+1);
			if (say)
				bot.say(to, say);
		} else if (message.match(/^!add/i)) {
			const chans = Object.keys(bot.chans);
			let command = message.substr(message.indexOf(' ')+1);
			command = config.COMMAND_PREFIX + command;
			chans.forEach(chan => {
				bot.say(chan, command);
			});
		}
	}
});

bot.addListener('error', (message) => {
	console.log('error: ', message);
});
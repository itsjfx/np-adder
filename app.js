const irc = require('irc');
const request = require('request');

const ircconfig = {
	channels: ['#yourchannel'],
	server: "irc.chat.twitch.tv",
	username: "",
	nick: "",
	password: "oauth:",
	debug: true
};

const ADD_DELAY = 5000;
const COMMAND_PREFIX = "!9kmmrbot addnp ";
const NP_URL = "https://jfx.ac/ausnp.txt";

const bot = new irc.Client(ircconfig.server, ircconfig.nick, ircconfig);

function addAccount(i, res, to) {
	bot.say(to, COMMAND_PREFIX + res[i]);
	if (i++ == res.length - 1) // starts at 0... minus 1 from len
		bot.say(to, "All done...");
	else
		setTimeout(() => {addAccount(i, res, to)}, ADD_DELAY); 
}

bot.addListener('message', (from, to, message) => {
	if (to.match(/^[#&]/)) {
		// channel message
		if (message.match(/^!go/i)) {
			bot.say(to, "Adding players with delay of " + ADD_DELAY + " ms");
			request(NP_URL, function (err, res, body) {
				if (err)
					console.log("Error downloading file: " + err);
				else
					addAccount(0, body.split(/\r?\n/), to);
			});
		} else if (message.match(/^!j/i)) {
			const chan = message.split(" ")[1];
			if (chan) {
				bot.join(chan);
				bot.say(to, "Joining " + chan);
			} else {
				bot.say(to, "Error joining channel: invalid");
			}
		}
	}
});

bot.addListener('error', (message) => {
	console.log('error: ', message);
});
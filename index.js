const tmi = require('tmi.js');
var fs = require('fs');
const os = require('os');
require('dotenv').config();
//Twitch Bot stuff ^

//Discord bot stuffs
const Discord = require('discord.js');
const client2 = new Discord.Client();
client2.commands = new Discord.Collection();
//Not using but just good to have...
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client2.commands.set(command.name, command);
}
//Discord bot ^

//Tiwtch
var tprefix = process.env.TPREFIX;
var username = process.env.USERNAME;
var password = process.env.PASSWORD;
//Discord
var token = process.env.TOKEN;
var prefix = process.env.DPREFIX;
var chanel = process.env.DISCOCHANEL;
var code = "";

console.log("Done! Starting login");
console.log(process.env.CHANNELS.split(","))


const opts = {
  identity: {
    username: username,
    password: password
  },
  channels: process.env.CHANNELS.split(",")
};


const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);


client.connect();

//Discord stuff
client2.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  const user = message.mentions.users.first();
  const member = message.guild.member(user);
  const author = message.author.id;
  const disconame = message.author.username;
  const channel = message.channel.id;

  if (message.content.startsWith(prefix+"say")){
    split = message.content.split(" ");
    console.log(username)
    console.log(password)
    console.log("Channel: "+split[1]+"\n"+split.slice(2).join(" "))
    client.say(split[1], split.slice(2).join(" "));
  }

  if (message.content.startsWith(prefix+"link")){
    split = message.content.split(" ");
    var code = split[1]
    message.reply("Please check DMs!")
    try {
      client2.users.cache.get(author)
          .send("Hello <@"+author+"> your link code that you entered is: "+code+" \n Please enter the code in twitch chat with "+tprefix+"code <codehere>\n this doesnt work btw!")
    } catch (error) {
      console.log(error);
      client2.reply("Error.");
    }
  }

  if (!client2.commands.has(command)) return;

	try {
		client2.commands.get(command).execute(message, args, user, member);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
//Discord stuff ^

//Twitch Stuff
function onMessageHandler (target, context, msg, self) {
  console.log(target)
  if (self) { return; } // Ignore messages from the bot
  console.log(msg)
  if (msg.startsWith(tprefix) === false) {
    client2.channels.cache.get(chanel).send("```Channel: "+target+"\n"+"User: "+context["username"]+"\n"+msg+"```");
  }
  
  if (msg.startsWith(tprefix+"say")){
    split = msg.split(" ")
    try {
      client2.channels.cache.get(split["1"]).send(split.slice(2).join(" "));
    } catch (error) {
      client.say(target, "Error! Did you put a channel? I got: "+split["1"])
      console.log(error)
    }
  }

  if (msg.startsWith(tprefix+"code")){
    split = msg.split(" ")
    if (split[1] == code){
      client.say("Hello user "+disconame)
    }
  }
}
//Twitch Stuff ^


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port, target, context, msg, self) {
  console.log(`* Connected to ${addr}:${port}`);
  console.log("Bot is now joinning channels");
}

client2.on('ready', () => {
  console.log(`Logged in as ${client2.user.tag}!`);
});

client2.login(token);
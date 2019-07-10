//Fetch the discordjs client
const Discord = require('discord.js')
const client = new Discord.Client({shardCount: 'auto'})

//Extra client appends
client.discord = Discord
client.moment = require('moment')
client.settings = require('./settings/settings.json')
client.settings.game = {}
client.settings.game.races = require('./settings/races.json').races
client.settings.game.roles = require('./settings/roles.json').roles
client.commands = []

//Send client to handlers
require('./library/game.js')(client)
require('./library/extendedFunctions.js')(client)
require('./library/events.js')(client)
require('./library/database.js')(client)

//Initialize bot
client.login(client.settings.bot.token)
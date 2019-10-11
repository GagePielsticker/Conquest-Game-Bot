// Fetch the discordjs client
const Discord = require('discord.js')
const client = new Discord.Client({ shardCount: 'auto' })

// Extra client appends
client.discord = Discord
client.settings = require('./settings/settings.json')

// Send client to handlers
require('./library/database.js')(client)
require('./library/extendedFunctions.js')(client)
require('./library/events.js')(client)
require('./library/database.js')(client)
require('./library/game.js')(client)
require('./library/cronJobs.js')(client)
// require('./library/dbl.js')(client)

// Initialize bot
client.login(client.settings.bot.token)

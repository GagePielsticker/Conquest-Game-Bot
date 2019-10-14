const Command = require('../command.js')
const si = require('systeminformation')
const humanizeDuration = require('humanize-duration')

module.exports = class StatsCommand extends Command {
  constructor (client) {
    super('stats', ['s', 'stat'], 'Get\'s stats for the bot', {
      usage: `${client.settings.bot.prefix}invite`,
      accountCheck: false,
      requiredPermission: null,
      category: 'general'
    })
    this.c = client
  }

  async run (message, args) {
    const cpu = await si.cpu()
    const mem = await si.mem()
    const operating = await si.osInfo()
    message.channel.send(
      this.c.em(message)
        .setTitle(':bar_chart: Statistics')
        .setDescription(this.c.settings.bot.botDescription)
        .addField('Users', `\`${this.c.users.size}\``, true)
        .addField('Guilds', `\`${this.c.guilds.size}\``, true)
        .addField('Language', '`NodeJS`', true)
        .addField('RAM\'s', `\`${Math.floor(mem.used / 1000000000)}gb/${Math.floor(mem.total / 1000000000)}gb\``, true)
        .addField('CPU', `\`${cpu.cores} Cores\``, true)
        .addField('Platform', `\`${operating.platform}\``, true)
        .addField('Shards', `\`${parseInt(this.c.options.shards) + 1}\``, true)
        .addField('Ping', `\`${this.c.ws.ping} ms\``, true)
        .addField('Uptime', `\`${humanizeDuration(this.c.uptime)}\``, true)
        .addField('Invite Link', `[Click Here](${this.c.settings.bot.inviteURL})`, true)
        .addField('Support Server', `[Click Here](${this.c.settings.bot.supportServer})`, true)
        .addField('Developer', '`uber#0001\nJPBBerry#0001`', true)
    )
  }
}

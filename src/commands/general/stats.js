module.exports.load = client => {
  const si = require('systeminformation')
  const humanizeDuration = require('humanize-duration')

  const command = {
    name: 'Stats',
    category: 'general',
    description: 'See bot statistics.',
    usage: `${client.settings.bot.prefix}stats`,
    requiredPermission: null,
    hasAccountCheck: false,

    async run (message) {
      const cpu = await si.cpu()
      const mem = await si.mem()
      const operating = await si.osInfo()
      const embed = new client.discord.MessageEmbed()
        .setTitle(':bar_chart: Statistics')
        .setDescription(client.settings.bot.botDescription)
        .addField('Users', `\`${client.users.size}\``, true)
        .addField('Guilds', `\`${client.guilds.size}\``, true)
        .addField('Language', '\`NodeJS\`', true)
        .addField('RAM\'s', `\`${Math.floor(mem.used / 1000000000)}gb/${Math.floor(mem.total / 1000000000)}gb\``, true)
        .addField('CPU', `\`${cpu.cores} Cores\``, true)
        .addField('Platform', `\`${operating.platform}\``, true)
        .addField('Shards', `\`${parseInt(client.options.shards) + 1}\``, true)
        .addField('Ping', `\`${client.ws.ping} ms\``, true)
        .addField('Uptime', `\`${humanizeDuration(client.uptime)}\``, true)
        .addField('Invite Link', `[Click Here](${client.settings.bot.inviteURL})`, true)
        .addField('Support Server', `[Click Here](${client.settings.bot.supportServer})`, true)
        .addField('Developer', '`uber#0001`', true)
        .setFooter(`${message.author.username}#${message.author.discriminator}`)
        .setTimestamp()
        .setColor(client.settings.bot.embedColor)
      message.channel.send(embed)
    }
  }

  client.commands.push(command)
}

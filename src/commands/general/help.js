const Command = require('../command.js')

module.exports = class HelpCommand extends Command {
  constructor (client) {
    super('help', ['h'], 'Show\'s all commands and how to use them.', {
      usage: `${client.settings.bot.prefix}help`,
      accountCheck: false,
      requiredPermission: null,
      category: 'general'
    })
    this.c = client
  }

  async run (message, args) {
    const cmd = args[0]
    if (cmd) {
      const command = this.c.commands.find(x => x.name.toLowerCase() === cmd.toLowerCase() || x.aliases.includes(cmd.toLowerCase))
      if (!command || command.category === 'dev') return this.c.sendError(message, `Invalid command: \`${cmd}\``)
      return message.channel.send(
        new this.c.discord.MessageEmbed()
          .setColor(this.c.settings.bot.embedColor)
          .setTitle(command.name)
          .addField('Description', `\`\`\`${command.description}\`\`\``)
          .addField('Usage', `\`\`\`${command.usage}\`\`\``)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
    }
    const embed = new this.c.discord.MessageEmbed()
      .setColor(this.c.settings.bot.embedColor)
      .setTitle('Help')
      .setDescription(`Use \`${this.c.settings.bot.prefix}help {command}\` to learn more about the command.`)
      .setFooter(message.author.tag)
      .setTimestamp()

    this.c.commands.map(x => x.category).filter(x => x !== 'dev') // remove dev
      .reduce((a, b) => { // remove dupes
        a = a || []
        if (!a.includes(b)) a.push(b)
        return a
      }, [])
      .forEach(category => {
        embed.addField(category.charAt(0).toUpperCase() + category.slice(1), // make 1st character uppercase
          '```' + '\n' +
                    this.c.commands.filter(x => x.category === category).map(x => x.name.toLowerCase()).join('\n') + '\n' +
                    '```'
        )
      })
    message.channel.send(embed)
  }
}

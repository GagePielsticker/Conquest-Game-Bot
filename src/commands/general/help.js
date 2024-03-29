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
      const command = this.c.commands.find(x => x.name.toLowerCase() === cmd.toLowerCase() || x.aliases.includes(cmd.toLowerCase()))
      if (!command || (this.c.dev && command.category === 'dev')) return this.c.sendError(message, `Invalid command: \`${cmd}\``)
      const embed = this.c.em(message)
        .setTitle(command.name)
        .addField('Description', `\`\`\`${command.description}\`\`\``)
        .addField('Usage', `\`\`\`${command.usage}\`\`\``)
      if (command.aliases.length > 0) embed.addField('Aliases', `\`\`\`${command.aliases.join(', ')}\`\`\``)
      return message.channel.send(embed)
    }
    const embed = this.c.em(message)
      .setTitle('Help')
      .setDescription(`Use \`${this.c.settings.bot.prefix}help {command}\` to learn more about the command.`)

    let commandCategories = this.c.commands.map(x => x.category)
    if (!this.c.dev) commandCategories = commandCategories.filter(x => x !== 'dev')

    commandCategories
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

const Command = require('../command.js')

module.exports = class PositionCommand extends Command {
  constructor (client) {
    super('position', ['pos'], 'Quick view the user position.', {
      usage: `${client.settings.bot.prefix}position`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const entry = await this.c.database.collection('users').findOne({ uid: message.author.id })
    message.channel.send(
      this.c.em(message)
        .setTitle(':map: Position')
        .setDescription(`X:\`${entry.xPos}\` Y:\`${entry.yPos}\``)
    )
  }
}

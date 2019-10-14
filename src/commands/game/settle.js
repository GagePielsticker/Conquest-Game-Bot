const Command = require('../command.js')

module.exports = class SettleCommand extends Command {
  constructor (client) {
    super('settle', [], 'Settle the tile you\'re currently on.', {
      usage: `${client.settings.bot.prefix}settle`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const name = args[0]
    if (!name) return this.c.sendError(message, `Name is required, \`${this.c.settings.bot.prefix}settle {name}\``)
    const user = await this.c.database.collection('users').findOne({ uid: message.author.id })
    message.channel.send(
      new this.c.discord.MessageEmbed()
        .setColor(this.c.settings.bot.embedColor)
        .setTitle('Confirm settle')
        .setDescription(`Settle Tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
        .addField('Name', name)
        .setFooter(message.author.tag)
        .setTimestamp()
    )
      .then(confirmMsg => {
        this.c.confirm(message, confirmMsg, {
          no: () => {
            confirmMsg.edit(
              new this.c.discord.MessageEmbed()
                .setColor(this.c.settings.bot.embedColor)
                .setTitle('Cancelled settle')
                .setFooter(message.author.tag)
                .setTimestamp()
            )
          },
          notime: () => {
            this.c.sendError(message, 'Did not react in time, cancelled', confirmMsg)
          },
          yes: () => {
            this.c.game.settleLocation(message.author.id, name)
              .then(() => {
                confirmMsg.edit(
                  new this.c.discord.MessageEmbed()
                    .setColor(this.c.settings.bot.embedColor)
                    .setTitle(`Settled tile! Welcome ${name} to the world!`)
                    .setDescription(`You've successfully claimed tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
                    .setFooter(message.author.tag)
                    .setTimestamp()
                )
              })
              .catch(e => this.c.sendError(message, e, confirmMsg))
          }
        })
      })
  }
}

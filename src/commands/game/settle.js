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
      this.c.em(message)
        .setTitle('Confirm settle')
        .setDescription(`Settle Tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
        .addField('Name', name)
    )
      .then(confirmMsg => {
        this.c.confirm(message, confirmMsg, {
          no: () => {
            confirmMsg.edit(
              this.c.em()
                .setTitle('Cancelled settle')
            )
          },
          notime: () => {
            this.c.sendError(message, 'Did not react in time, cancelled', confirmMsg)
          },
          yes: () => {
            this.c.api.settleLocation(message.author.id, name)
              .then(() => {
                confirmMsg.edit(
                  this.c.em(message)
                    .setTitle(`Settled tile! Welcome ${name} to the world of Serenwyn!`)
                    .setDescription(`You've successfully claimed tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
                )
              })
              .catch(e => this.c.sendError(message, e, confirmMsg))
          }
        })
      })
  }
}

const Command = require('../command.js')

module.exports = class StopCommand extends Command {
  constructor (client) {
    super('stop', [], 'Stops moving and places you in the place you are', {
      usage: `${client.settings.bot.prefix}stop`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    this.c.game.stopUser(message.author.id)
      .then((res) => {
        const { xPos, yPos } = res
        message.channel.send(
          this.c.em(message)
            .setTitle('Stopped moving')
            .setDescription(`Your location is now; X: ${xPos}, Y: ${yPos}`)
        )
      })
      .catch(e => this.c.sendError(message, e))
  }
}

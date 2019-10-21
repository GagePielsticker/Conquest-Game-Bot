const Command = require('../command.js')

module.exports = class SetCommand extends Command {
  constructor (client) {
    super('settings', ['set'], 'Setttings', {
      usage: `${client.settings.bot.prefix}settings {setting}`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    const setting = (args[0] || '').toLowerCase()
    if (setting === 'empire') {
      const newName = args[1]
      if (!newName) return this.c.sendError(message, `Missing argument, do ${this.c.settings.bot.prefix}set empire {empire-name}`)
      this.c.game.setEmpireName(message.author.id, newName)
        .then(() => {
          this.c.sendSuccess(message, `Set your empire name to \`${newName}\`!`)
        })
        .catch(e => this.c.sendError(message, e))
    } else {
      this.c.sendError(message, `Invalid setting \`${setting}\`\n\nChoose from: \`empire\``)
    }
  }
}

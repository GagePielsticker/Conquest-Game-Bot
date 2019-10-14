const Command = require('../command.js')

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super('invite', ['i'], 'Invites the bot to the server.', {
      usage: `${client.settings.bot.prefix}invite`,
      accountCheck: false,
      requiredPermission: null,
      category: 'general'
    })
    this.c = client
  }

  async run (message, args) {
    message.channel.send(
      this.c.em(message)
        .setColor(this.c.settings.bot.embedColor)
        .setTitle(':mailbox_with_mail: Invite')
        .setDescription(`Invite the bot [here](${this.c.settings.bot.inviteURL})!`)
        .setFooter(message.author.tag)
        .setTimestamp()
    )
  }
}

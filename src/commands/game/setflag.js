const Command = require('../command.js')
// copy
function validURL (str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(str)
}
// paste
const imageTypes = ['webp', 'png', 'jpg', 'jpeg']

module.exports = class SetFlagCommand extends Command {
  constructor (client) {
    super('setflag', ['sf'], 'Set\'s your flag', {
      usage: `${client.settings.bot.prefix}setflag {url}`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const flag = message.content.split(' ').splice(1).join(' ') || (message.attachments.first() || {}).url
    if (!flag) return this.c.sendError(message, `Missing Flag Image URL, do ${this.c.settings.bot.prefix}setflag {flag url}`)
    if (!validURL(flag)) return this.c.sendError(message, 'Malformed URL')
    const split = flag.split('.')
    if (!imageTypes.includes(split[split.length - 1])) return this.c.sendError(message, 'Invalid image type')
    this.c.game.setFlag(message.author.id, flag)
      .then(() => {
        message.channel.send(
          new this.c.discord.MessageEmbed()
            .setColor(this.c.settings.bot.embedColor)
            .setTitle('Flag Image Set!')
            .setThumbnail(flag)
            .setFooter(message.author.tag)
            .setTimestamp()
        )
      })
      .catch(e => this.c.sendError(message, e))
  }
}

module.exports.load = client => {
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

  const command = {
    name: 'SetFlag',
    category: 'game',
    description: 'Set\'s your flag',
    usage: `${client.settings.bot.prefix}setflag {flag url}`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const flag = message.content.split(' ').splice(1).join(' ')
      if (!flag) return client.sendError(message, `Missing Flag Image URL, do ${client.settings.bot.prefix}setflag {flag url}`)
      if (!validURL(flag)) return client.sendError(message, 'Malformed URL')
      const split = flag.split('.')
      if (!imageTypes.includes(split[split.length - 1])) return client.sendError(message, 'Invalid image type')
      client.game.setFlag(message.author.id, flag)
        .then(() => {
          message.channel.send(
            new client.discord.MessageEmbed()
              .setColor('GREEN')
              .setTitle('Flag Image Set!')
              .setThumbnail(flag)
              .setFooter(message.author.tag)
              .setTimestamp()
          )
        })
        .catch(e => client.sendError(message, e))
    }
  }

  client.commands.push(command)
}

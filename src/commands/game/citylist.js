const Command = require('../command.js')

module.exports = class CityListCommand extends Command {
  constructor (client) {
    super('citylist', ['cl'], 'List your cities', {
      usage: `${client.settings.bot.prefix}citylist`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    let page = args[0] || 1
    if (isNaN(page)) return this.c.sendError(message, 'Invalid number for page')
    page = Number(page)
    this.c.game.getUserCityNames(message.author.id, page)
      .then(response => {
        const { cities, totalPages } = response
        if (totalPages === 0) return this.c.sendError(message, 'You have no cities!')
        if (page > totalPages) return this.c.sendError(message, `Invalid page, max pages: ${totalPages}`)
        message.channel.send(
          this.c.em(message)
            .setTitle('Your cities')
            .setDescription(`You are viewing page \`${page}\` / \`${totalPages}\`` + '\n' +
                  '```' + '\n' +
                    `${cities.length < 1 ? 'none'
                    : cities.map(x => `${x.index}.) ${x.name}`).join('\n')
                  }` + '\n' +
                  '```' + '\n\n' +
                  `${page + 1 > totalPages ? '' : `Do \`${this.c.settings.bot.prefix}city list ${page + 1}\` to view next page`}`
            )
        )
      })
      .catch(e => this.c.sendError(message, e))
  }
}

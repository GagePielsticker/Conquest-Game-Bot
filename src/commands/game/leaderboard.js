const Command = require('../command.js')

module.exports = class LeaderboardCommand extends Command {
  constructor (client) {
    super('leaderboard', ['lb'], 'View leaderboards in different subjects.', {
      usage: `${client.settings.bot.prefix}leaderboard {subject} {page-number}`,
      accountCheck: false,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    let { 0: subject, 1: page } = args
    page = page || 1
    if (isNaN(page)) return this.c.sendError(message, 'Invalid page number')
    page = Number(page)
    if (!['gold', 'city', 'population'].includes(subject)) return this.c.sendError(message, 'Invalid subject. Subjects; `gold`, `city`, `population`')
    this.c.game.getLeaderboard(subject, page)
      .then(response => {
        const { leaderboard, totalPages } = response
        if (page > totalPages) return this.c.sendError(message, `Invalid page, max pages: ${totalPages}`)
        message.channel.send(
          this.c.em(message)
            .setTitle(`Leaderboard for ${subject}`)
            .setDescription(`You are viewing page \`${page}\` / \`${totalPages}\`` + '\n' +
                    '```' + '\n' +
                      `${leaderboard.length < 1 ? 'none'
                      : leaderboard.map(x => `${x.index}.) ${this.c.users.get(x.user).username}`).join('\n')
                    }` + '\n' +
                    '```' + '\n\n' +
                    `${page + 1 > totalPages ? '' : `Do \`${this.c.settings.bot.prefix}leaderboard ${subject} ${page + 1}\` to view next page`}`
            )
        )
      })
      .catch(e => this.c.sendError(message, e))
  }
}

module.exports.load = client => {
  const command = {
    name: 'Leaderboard',
    category: 'game',
    description: 'View leaderboards in different subjects.',
    usage: `${client.settings.bot.prefix}leaderboard {subject} {page-number}`,
    requiredPermission: null,
    hasAccountCheck: false,

    async run (message) {
      let { 0: subject, 1: page } = message.content.split(' ').splice(1)
      page = page || 1
      if (isNaN(page)) return client.sendError(message, 'Invalid page number')
      page = Number(page)
      if (!['gold', 'city', 'population'].includes(subject)) return client.sendError(message, 'Invalid subject. Subjects; `gold`, `city`, `population`')
      client.game.getLeaderboard(subject, page)
        .then(response => {
          const { leaderboard, totalPages } = response
          message.channel.send(
            new client.discord.MessageEmbed()
              .setColor(client.settings.bot.embedColor)
              .setTitle(`Leaderboard for ${subject}`)
              .setDescription(`You are viewing page \`${page}\` / \`${totalPages}\`` + '\n' +
                    '```' + '\n' +
                      `${leaderboard.length < 1 ? 'none'
                      : leaderboard.map(x => `${x.index}.) ${client.users.get(x.user).username}`).join('\n')
                    }` + '\n' +
                    '```' + '\n\n' +
                    `${leaderboard.length > 1 ? `Do \`${client.settings.bot.prefix}leaderboard ${subject} ${page + 1}\` to view next page` : ''}`
              )
              .setFooter(message.author.tag)
              .setTimestamp()
          )
        })
        .catch(e => client.sendError(message, e))
    }
  }

  client.commands.push(command)
}

module.exports.load = client => {
  const humanizeDuration = require('humanize-duration')
  const moment = require('moment')

  const command = {
    name: 'Scout',
    category: 'game',
    description: 'Scouts the tile you\'re currently on.',
    usage: `${client.settings.bot.prefix}scout`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const cooldown = client.game.scoutCooldown.get(message.author.id)
      if (cooldown) return client.sendError(message, `Already scouting tile, wait ${humanizeDuration(cooldown.endTime - moment().unix())}`)
      const execUser = await client.database.collection('users').findOne({ uid: message.author.id })
      const travelTime = await client.game.calculateScoutTime(message.author.id)
      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle('Confirm Scout')
          .setDescription(`Tile: X: \`${execUser.xPos}\`, Y: \`${execUser.yPos}\``)
          .addField('Will take', `\`${humanizeDuration(travelTime)}\``)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
        .then(async confirmMsg => {
          client.confirm(message, confirmMsg, {
            no: () => {
              confirmMsg.edit(
                new client.discord.MessageEmbed()
                  .setColor(client.settings.bot.embedColor)
                  .setTitle('Cancelled Scout')
                  .setFooter(message.author.tag)
                  .setTimestamp()
              )
            },
            notime: () => {
              client.sendError(message, 'Did not react in time, cancelled', confirmMsg)
            },
            yes: () => {
              client.game.scoutTile(message.author.id)
                .then(async response => {
                  let { time, mapEntry } = response
                  if (message.content.match(/-d/) && client.beta) time = 1000
                  const msg = time != null ? await confirmMsg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle('Scouting Tile')
                      .setDescription(`Tile: X: \`${mapEntry.xPos}\`, Y: \`${mapEntry.yPos}\`\n\nThis message will be changed when time is over!`)
                      .addField('Will be done scouting in', `\`${humanizeDuration(time)}\``)
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  ) : confirmMsg
                  setTimeout(async () => {
                    const embed = new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle('Scouted Tile')
                      .setFooter(message.author.tag)
                      .setTimestamp()
                    let baseDescription = `Tile: X: \`${mapEntry.xPos}\`, Y: \`${mapEntry.yPos}\`\n\n`
                    if (mapEntry.city != null) {
                      baseDescription += `You found a level \`${mapEntry.city.level}\` city!`
                      if (mapEntry.city.owner) {
                        const owner = await client.database.collection('users').findOne({ uid: mapEntry.city.owner })
                        const ownerUser = client.users.get(mapEntry.city.owner)
                        if (owner.flagURL != null) embed.setThumbnail(owner.flagURL)
                        embed.addField('Owner', `\`${ownerUser.username}\``, true)
                        if (owner.empireName != null) embed.addField('Empire Name', `\`${owner.empireName}\``, true)
                      } else {
                        embed.addField('Owner', '`NPC`', true)
                      }
                      if (mapEntry.city.name) embed.addField('City Name', `\`${mapEntry.city.name}\``, true)
                      embed.addField('Total Resources', `\`${
                      (
                          mapEntry.city.resources.stone +
                          mapEntry.city.resources.metal +
                          mapEntry.city.resources.wood +
                          mapEntry.city.resources.food
                      ) // uber i hate you please fix resources you stupid weeb
                        .toLocaleString()
                    }\` combined resources.`, true
                      )
                      embed.addField('Total Population', `\`${
                      (
                        Object.values(mapEntry.city.population)
                          .reduce((a, b) => a + b, 0)
                      )
                        .toLocaleString()
                    }\` people.`, true
                      )
                      embed.addField('In Stasis', '`' + (mapEntry.city.inStasis ? 'Yes' : 'No') + '`', true)
                    } else {
                      baseDescription += 'Nothing was found!'
                    }
                    if (mapEntry.hasWonder) baseDescription += '\nTile has a wonder!'
                    else baseDescription += '\nTile has no wonder.'
                    embed.setDescription(baseDescription)

                    msg.edit(embed)
                  }, time || 0)
                })
                .catch(e => client.sendError(message, e))
            }
          })
        })
    }
  }

  client.commands.push(command)
}

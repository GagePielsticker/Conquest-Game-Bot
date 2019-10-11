module.exports.load = client => {
  const humanizeDuration = require('humanize-duration')
  const moment = require('moment')

  const command = {
    name: 'Scout',
    category: 'game',
    description: 'Scouts the tile you\'re currently on.',
    usage: `${client.settings.bot.prefix}scout`,
    requiredPermission: null,
    hasAccountCheck: false,

    async run (message) {
      const cooldown = client.game.scoutCooldown.get(message.author.id)
      if (cooldown) return client.sendError(message, `Already scouting tile, wait ${humanizeDuration(cooldown.endTime - moment().unix())}`)
      const execUser = await client.database.collection('users').findOne({ uid: message.author.id })
      const travelTime = await client.game.calculateScoutTime(execUser.xPos, execUser.yPos)
      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle('Confirm Scout')
          .setDescription(`Tile: X: ${execUser.xPos}, Y: ${execUser.yPos}`)
          .addField('Will take', `${humanizeDuration(travelTime)}`)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
        .then(async confirmMsg => {
          client.confirm(message, confirmMsg, {
            no: () => {
              confirmMsg.edit(
                new client.discord.MessageEmbed()
                  .setColor('RED')
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
                .then(response => {
                  const { time, mapEntry } = response
                  confirmMsg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle('Scouting Tile')
                      .setDescription(`Tile: X: ${mapEntry.xPos}, Y: ${mapEntry.yPos}\n\nThis message will be changed when time is over!`)
                      .addField('Will be done scouting in', `${humanizeDuration(time)}`)
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  )
                    .then((msg) => {
                      setTimeout(async () => {
                        const embed = new client.discord.MessageEmbed()
                          .setColor(client.settings.bot.embedColor)
                          .setTitle('Scouted Tile')
                          .setFooter(message.author.tag)
                          .setTimestamp()
                        let baseDescription = `Tile: X: ${mapEntry.xPos}, Y: ${mapEntry.yPos}\n\n`
                        if (mapEntry.city != null) {
                          baseDescription += `You found a level ${mapEntry.city.level} city!`
                          embed.addField('')
                          if (mapEntry.city.owner) {
                            const owner = await client.database.collection('users').findOne({ uid: mapEntry.city.owner })
                            const ownerUser = client.users.get(mapEntry.city.owner)
                            if (owner.flagURL != null) embed.setThumbnail(owner.flagURL)
                            embed.addField('Owner', ownerUser.username)
                            embed.addField('Empire Name', owner.empireName)
                          } else {
                            embed.addField('Owner', 'NPC')
                          }
                          embed.addField('Total Resources', `${
                      (
                          mapEntry.city.resources.stone +
                          mapEntry.city.resources.metal +
                          mapEntry.city.resources.wood +
                          mapEntry.city.resources.food
                      ) // uber i hate you please fix resources you stupid weeb
                        .toLocaleString()
                    } combined resources.`
                          )
                          embed.addField('Total Population', `${
                      (
                        mapEntry.city.population
                          .reduce((a, b) => a + b, 0)
                      )
                        .toLocaleString()
                    } people.`
                          )
                          embed.addField('In Stasis', mapEntry.city.inStasis ? 'Yes' : 'No')
                        } else {
                          baseDescription += 'Nothing was found!'
                        }
                        if (mapEntry.hasWounder) baseDescription += '\nTile has a wounder!'
                        else baseDescription += '\nTile has no wounder.'
                        embed.setDescription(baseDescription)

                        msg.edit(embed)
                      }, time)
                    })
                })
                .catch(e => client.sendError(message, e))
            }
          })
        })
    }
  }

  client.commands.push(command)
}

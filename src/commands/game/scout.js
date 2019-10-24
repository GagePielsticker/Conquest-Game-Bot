const Command = require('../command.js')
const humanizeDuration = require('humanize-duration')
const moment = require('moment')

module.exports = class ScoutCommand extends Command {
  constructor (client) {
    super('scout', [], 'Scouts the tile you\'re currently on.', {
      usage: `${client.settings.bot.prefix}scout`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const cooldown = this.c.game.scoutCooldown.get(message.author.id)
    if (cooldown) return this.c.sendError(message, `Already scouting tile, wait ${humanizeDuration(cooldown.endTime - moment().unix())}`)
    const execUser = await this.c.game.getUser(message.author.id)
    const travelTime = await this.c.game.calculateScoutTime(message.author.id)
    message.channel.send(
      this.c.em(message)
        .setColor(this.c.settings.bot.embedColor)
        .setTitle('Confirm Scout')
        .setDescription(`Tile: X: \`${execUser.xPos}\`, Y: \`${execUser.yPos}\``)
        .addField('Will take', `\`${humanizeDuration(travelTime)}\``)
    )
      .then(async confirmMsg => {
        this.c.confirm(message, confirmMsg, {
          no: () => {
            confirmMsg.edit(
              this.c.em(message)
                .setTitle('Cancelled Scout')
            )
          },
          notime: () => {
            this.c.sendError(message, 'Did not react in time, cancelled', confirmMsg)
          },
          yes: () => {
            this.c.game.scoutTile(message.author.id)
              .then(async response => {
                let { time, mapEntry } = response
                if (message.content.match(/-d/) && this.c.dev) time = 1000
                const msg = time != null ? await confirmMsg.edit(
                  this.c.em(message)
                    .setTitle('Scouting Tile')
                    .setDescription(`Tile: X: \`${mapEntry.xPos}\`, Y: \`${mapEntry.yPos}\`\n\nThis message will be changed when time is over!`)
                    .addField('Will be done scouting in', `\`${humanizeDuration(time)}\``)
                ) : confirmMsg
                setTimeout(async () => {
                  const embed = this.c.em(message)
                    .setTitle('Scouted Tile')
                  let baseDescription = `Tile: X: \`${mapEntry.xPos}\`, Y: \`${mapEntry.yPos}\`\n\n`
                  if (mapEntry.city != null) {
                    baseDescription += `You found a level \`${mapEntry.city.level}\` city!`
                    if (mapEntry.city.owner) {
                      const owner = await this.c.game.getUser(mapEntry.city.owner)
                      const ownerUser = this.c.users.get(mapEntry.city.owner)
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
              .catch(e => this.c.sendError(message, e))
          }
        })
      })
  }
}

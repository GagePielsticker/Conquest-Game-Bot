const Command = require('../command.js')

module.exports = class CityCommand extends Command {
  constructor (client) {
    super('city', [], 'City settings and information', {
      usage: `${client.settings.bot.prefix}city {city name}`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const name = args[0]
    if (!name) return this.c.sendError(message, `Missing name, do ${this.c.settings.bot.prefix}city {city-name}`)
    const mapEntry = await this.c.game.getCityByName(message.author.id, name)
    if (!mapEntry) return this.c.sendError(message, 'Invalid city')
    message.channel.send(
      new this.c.discord.MessageEmbed()
        .setColor(this.c.settings.bot.embedColor)
        .setTitle(`Settings for city: ${mapEntry.city.name}`)
        .setDescription(`City on tile: X: \`${mapEntry.xPos}\`, Y: \`${mapEntry.yPos}\`` + '\n\n' +
              'Settings: ' + '\n' +
              ':one: Information' + '\n' +
              ':two: Name' + '\n' +
              ':three: Population' + '\n' +
              ':four: Level Up' +

              '\n\n' +
              'React with the respective setting number to change those settings!'
        )
        .setFooter(message.author.tag)
        .setTimestamp()
    )
      .then(msg => {
        this.c.reactMenu(message, msg, [
          {
            emoji: '1⃣',
            fn: () => {
              msg.edit(
                new this.c.discord.MessageEmbed()
                  .setColor(this.c.settings.bot.embedColor)
                  .setTitle(`City (${mapEntry.city.name})`)
                  .setDescription('Here you can view statistics of your city!')
                  .addField('Position', `X: \`${mapEntry.city.xPos}\` Y: \`${mapEntry.city.yPos}\``, true)
                  .addField('Level', `\`${mapEntry.city.level}\``, true)
                  .addField('Has Stasis', `\`${mapEntry.city.inStasis ? 'Yes' : 'No'}\``, true)
                  .addField('Resources',
                    'Stone:' + `\`${mapEntry.city.resources.stone}\` / \`${mapEntry.city.resources.maxStone}\`` + '\n' +
                    'Metal:' + `\`${mapEntry.city.resources.metal}\` / \`${mapEntry.city.resources.maxMetal}\`` + '\n' +
                    'Wood:' + `\`${mapEntry.city.resources.wood}\` / \`${mapEntry.city.resources.maxWood}\`` + '\n' +
                    'Food:' + `\`${mapEntry.city.resources.food}\` / \`${mapEntry.city.resources.maxFood}\`` + '\n'
                    , true)
                  .addField('Population', `${Object.keys(mapEntry.city.population).map(x => `${x.charAt(0).toUpperCase() + x.slice(1)}: \`${mapEntry.city.population[x]}\``).join('\n')}`, true)
                  .setFooter(message.author.tag)
                  .setTimestamp()
              )
            }
          },
          { // name
            emoji: '2⃣',
            fn: () => {
              msg.edit(
                new this.c.discord.MessageEmbed()
                  .setColor(this.c.settings.bot.embedColor)
                  .setTitle(`Set the name for ${mapEntry.city.name}`)
                  .setDescription('Send the new name for your city!')
                  .setFooter(message.author.tag)
                  .setTimestamp()
              ).then(async msg => {
                let newName = await this.c.messageMenu(message, msg)
                if (!newName) return
                newName = newName.split(' ')[0]
                this.c.game.setCityName(message.author.id, mapEntry.xPos, mapEntry.yPos, newName)
                  .then(() => {
                    msg.edit(
                      new this.c.discord.MessageEmbed()
                        .setColor(this.c.settings.bot.embedColor)
                        .setTitle('New city name!')
                        .setDescription(`${mapEntry.city.name} is now called ${newName}!`)
                        .setFooter(message.author.tag)
                        .setTimestamp()
                    )
                  })
                  .catch(e => this.c.sendError(message, e, msg))
              })
            }
          },
          { // population
            emoji: '3⃣',
            fn: () => {
              msg.edit(
                new this.c.discord.MessageEmbed()
                  .setColor(this.c.settings.bot.embedColor)
                  .setTitle('Move population')
                  .setDescription('Select a population to move people from:' + '\n\n' +
                        Object.keys(mapEntry.city.population).map(x => `\`${x}\`) ${mapEntry.city.population[x]}`).join('\n') + '\n' +
                        'Send the job of which you want to take people from in this channel'
                  )
                  .setFooter(message.author.tag)
                  .setTimestamp()
              ).then(async msg => {
                let populationFrom = await this.c.messageMenu(message, msg)
                if (!populationFrom) return
                populationFrom = populationFrom.toLowerCase()
                if (!Object.keys(mapEntry.city.population).includes(populationFrom)) return this.c.sendError(message, `Invalid population type \`${populationFrom}\``, msg)
                msg.edit(
                  new this.c.discord.MessageEmbed()
                    .setColor(this.c.settings.bot.embedColor)
                    .setTitle('Move population')
                    .setDescription('Select a population to move people to:' + '\n\n' +
                          Object.keys(mapEntry.city.population).map(x => `\`${x}\`) ${mapEntry.city.population[x]}`).join('\n') + '\n' +
                          'Send the job of which you want to move people from in this channel'
                    )
                    .setFooter(message.author.tag)
                    .setTimestamp()
                ).then(async msg => {
                  let populationTo = await this.c.messageMenu(message, msg)
                  if (!populationTo) return
                  populationTo = populationTo.toLowerCase()
                  if (!Object.keys(mapEntry.city.population).includes(populationTo)) return this.c.sendError(message, `Invalid population type \`${populationTo}\``, msg)
                  msg.edit(
                    new this.c.discord.MessageEmbed()
                      .setColor(this.c.settings.bot.embedColor)
                      .setTitle('Move population')
                      .setDescription('Respond with how many people you want to move')
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  ).then(async msg => {
                    var amountToMove = await this.c.messageMenu(message, msg)
                    if (!amountToMove) return
                    if (isNaN(amountToMove)) return this.c.sendError(message, `Invalid number: \`${amountToMove}\``, msg)
                    amountToMove = Math.floor(amountToMove)
                    msg.edit(
                      new this.c.discord.MessageEmbed()
                        .setColor(this.c.settings.bot.embedColor)
                        .setTitle('Move population')
                        .setDescription(`Confirm:\nMove \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
                        .setFooter(message.author.tag)
                    ).then(msg => {
                      this.c.confirm(message, msg, {
                        no: () => {
                          msg.edit(
                            new this.c.discord.MessageEmbed()
                              .setColor(this.c.settings.bot.embedColor)
                              .setTitle('Cancelled population move')
                              .setFooter(message.author.tag)
                              .setTimestamp()
                          )
                        },
                        notime: () => {
                          this.c.sendError(message, 'Ran out of time, cancelled', msg)
                        },
                        yes: () => {
                          this.c.game.changePopulationJob(message.author.id, mapEntry.xPos, mapEntry.yPos, populationFrom, populationTo, amountToMove)
                            .then(() => {
                              msg.edit(
                                new this.c.discord.MessageEmbed()
                                  .setColor(this.c.settings.bot.embedColor)
                                  .setTitle(`Moved population in ${mapEntry.city.name}`)
                                  .setDescription(`Moved \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
                                  .setFooter(message.author.tag)
                                  .setTimestamp()
                              )
                            })
                            .catch(e => this.c.sendError(message, e, msg))
                        }
                      })
                    })
                  })
                })
              })
            }
          },
          {
            emoji: '4⃣',
            fn: async () => {
              const amountToLevelUp = await this.c.game.calculateLevelCost(mapEntry.city.level)
              msg.edit(
                new this.c.discord.MessageEmbed()
                  .setColor(this.c.settings.bot.embedColor)
                  .setTitle(`Level up ${mapEntry.city.name}`)
                  .setDescription(`This will take \`${amountToLevelUp.toLocaleString()}\` gold.\nAre you sure?`)
                  .setFooter(message.author.tag)
                  .setTimestamp()
              )
                .then(msg => {
                  this.c.confirm(message, msg, {
                    no: () => {
                      msg.edit(
                        new this.c.discord.MessageEmbed()
                          .setColor(this.c.setting.bot.embedColor)
                          .setTitle('Cancelled level up')
                          .setFooter(message.author.tag)
                          .setTimestamp()
                      )
                    },
                    notime: () => {
                      this.c.sendError(message, 'Ran out of time, cancelled', msg)
                    },
                    yes: () => {
                      this.c.game.levelCity(message.author.id, mapEntry.xPos, mapEntry.yPos)
                        .then(() => {
                          msg.edit(
                            new this.c.discord.MessageEmbed()
                              .setColor(this.c.settings.bot.embedColor)
                              .setTitle(`Leveled up ${mapEntry.city.name}!`)
                              .setDescription(`Congratulations on leveling up to ${mapEntry.city.level + 1}`)
                              .setFooter(message.author.tag)
                              .setTimestamp()
                          )
                        })
                        .catch(e => this.c.sendError(message, e, msg))
                    }
                  })
                })
            }
          }
        ])
      })
  }
}

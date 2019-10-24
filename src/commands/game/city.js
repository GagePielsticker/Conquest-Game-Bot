const Command = require('../command.js')

module.exports = class CityCommand extends Command {
  constructor (client) {
    super('city', [], 'City settings and information', {
      usage: `${client.settings.bot.prefix}city {city name}`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    const name = args[0]
    if (!name) return this.c.sendError(message, `Missing name, do ${this.c.settings.bot.prefix}city {city-name}`)
    const city = await this.c.game.getCityByName(message.author.id, name)
    if (!city) return this.c.sendError(message, 'Invalid city')
    message.channel.send(
      this.c.em(message)
        .setTitle(`Settings for city: ${city.name}`)
        .setDescription(`City on tile: X: \`${city.xPos}\`, Y: \`${city.yPos}\`` + '\n\n' +
              'Settings: ' + '\n' +
              ':one: Information' + '\n' +
              ':two: Name' + '\n' +
              ':three: Population' + '\n' +
              ':four: Level Up' + '\n' +
              ':five: Delete' +

              '\n\n' +
              'React with the respective setting number to change those settings!'
        )
    )
      .then(msg => {
        this.c.reactMenu(message, msg, [
          {
            emoji: '1⃣',
            fn: () => {
              msg.edit(
                this.c.em(message)
                  .setTitle(`City (${city.name})`)
                  .setDescription('Here you can view statistics of your city!')
                  .addField('Position', `X: \`${city.xPos}\` Y: \`${city.yPos}\``, true)
                  .addField('Level', `\`${city.level}\``, true)
                  .addField('Has Stasis', `\`${city.inStasis ? 'Yes' : 'No'}\``, true)
                  .addField('Resources',
                    'Stone:' + `\`${city.resources.stone}\` / \`${city.resources.maxStone}\`` + '\n' +
                    'Metal:' + `\`${city.resources.metal}\` / \`${city.resources.maxMetal}\`` + '\n' +
                    'Wood:' + `\`${city.resources.wood}\` / \`${city.resources.maxWood}\`` + '\n' +
                    'Food:' + `\`${city.resources.food}\` / \`${city.resources.maxFood}\`` + '\n'
                    , true)
                  .addField('Population', `${Object.keys(city.population).map(x => `${x.charAt(0).toUpperCase() + x.slice(1)}: \`${city.population[x]}\``).join('\n')}`, true)
              )
            }
          },
          { // name
            emoji: '2⃣',
            fn: () => {
              msg.edit(
                this.c.em(message)
                  .setTitle(`Set the name for ${city.name}`)
                  .setDescription('Send the new name for your city!')
              ).then(async msg => {
                let newName = await this.c.messageMenu(message, msg)
                if (!newName) return
                newName = newName.split(' ')[0]
                this.c.game.setCityName(message.author.id, city.xPos, city.yPos, newName)
                  .then(() => {
                    msg.edit(
                      this.c.em(message)
                        .setTitle('New city name!')
                        .setDescription(`${city.name} is now called ${newName}!`)
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
                this.c.em(message)
                  .setTitle('Move population')
                  .setDescription('Select a population to move people from:' + '\n\n' +
                        Object.keys(city.population).map(x => `\`${x}\`) ${city.population[x]}`).join('\n') + '\n' +
                        'Send the job of which you want to take people from in this channel'
                  )
              ).then(async msg => {
                let populationFrom = await this.c.messageMenu(message, msg)
                if (!populationFrom) return
                populationFrom = populationFrom.toLowerCase()
                if (!Object.keys(city.population).includes(populationFrom)) return this.c.sendError(message, `Invalid population type \`${populationFrom}\``, msg)
                msg.edit(
                  this.c.em(message)
                    .setTitle('Move population')
                    .setDescription('Select a population to move people to:' + '\n\n' +
                          Object.keys(city.population).map(x => `\`${x}\`) ${city.population[x]}`).join('\n') + '\n' +
                          'Send the job of which you want to move people from in this channel'
                    )
                ).then(async msg => {
                  let populationTo = await this.c.messageMenu(message, msg)
                  if (!populationTo) return
                  populationTo = populationTo.toLowerCase()
                  if (!Object.keys(city.population).includes(populationTo)) return this.c.sendError(message, `Invalid population type \`${populationTo}\``, msg)
                  msg.edit(
                    this.c.em(message)
                      .setTitle('Move population')
                      .setDescription('Respond with how many people you want to move')
                  ).then(async msg => {
                    var amountToMove = await this.c.messageMenu(message, msg)
                    if (!amountToMove) return
                    if (isNaN(amountToMove)) return this.c.sendError(message, `Invalid number: \`${amountToMove}\``, msg)
                    amountToMove = Math.floor(amountToMove)
                    msg.edit(
                      this.c.em(message)
                        .setTitle('Move population')
                        .setDescription(`Confirm:\nMove \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
                    ).then(msg => {
                      this.c.confirm(message, msg, {
                        no: () => {
                          msg.edit(
                            this.c.em(message)
                              .setTitle('Cancelled population move')
                          )
                        },
                        notime: () => {
                          this.c.sendError(message, 'Ran out of time, cancelled', msg)
                        },
                        yes: () => {
                          this.c.game.changePopulationJob(message.author.id, city.xPos, city.yPos, populationFrom, populationTo, amountToMove)
                            .then(() => {
                              msg.edit(
                                this.c.em(message)
                                  .setTitle(`Moved population in ${city.name}`)
                                  .setDescription(`Moved \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
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
              const amountToLevelUp = await this.c.game.calculateLevelCost(city.level)
              msg.edit(
                this.c.em(message)
                  .setTitle(`Level up ${city.name}`)
                  .setDescription(`This will take \`${amountToLevelUp.toLocaleString()}\` gold.\nAre you sure?`)
              )
                .then(msg => {
                  this.c.confirm(message, msg, {
                    no: () => {
                      msg.edit(
                        this.c.em(message)
                          .setTitle('Cancelled level up')
                      )
                    },
                    notime: () => {
                      this.c.sendError(message, 'Ran out of time, cancelled', msg)
                    },
                    yes: () => {
                      this.c.game.levelCity(message.author.id, city.xPos, city.yPos)
                        .then(() => {
                          msg.edit(
                            this.c.em(message)
                              .setTitle(`Leveled up ${city.name}!`)
                              .setDescription(`Congratulations on leveling up to ${city.level + 1}`)
                          )
                        })
                        .catch(e => this.c.sendError(message, e, msg))
                    }
                  })
                })
            }
          },
          {
            emoji: '5⃣',
            fn: () => {
              msg.edit(
                this.c.em(message)
                  .setTitle(`Remove ${city.name}?`)
                  .setDescription('This action can not be reversed.')
              )
                .then(msg => {
                  this.c.confirm(message, msg, {
                    no: () => {
                      msg.edit(
                        this.c.em(message)
                          .setTitle('Cancelled, city not deleted')
                      )
                    },
                    notime: () => {
                      msg.edit(
                        this.c.em(message)
                          .setDescription('Ran out of time, city not deleted')
                      )
                    },
                    yes: () => {
                      this.c.game.destroyCity(message.author.id, city.xPos, city.yPos)
                        .then(() => {
                          msg.edit(
                            this.c.em(message)
                              .setTitle('Successfully removed city')
                          )
                        })
                        .catch(err => this.c.sendError(message, err, msg))
                    }
                  })
                })
            }
          }
        ])
      })
  }
}

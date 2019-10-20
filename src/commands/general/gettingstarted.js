const Command = require('../command.js')

module.exports = class GettingStartedCommand extends Command {
  constructor (client) {
    super('gettingstarted', ['gs', 'faq', 'howto'], 'List of things to get you started on using the bot', {
      usage: `${client.settings.bot.prefix}gettingstarted`,
      accountCheck: false,
      requiredPermission: null,
      category: 'general'
    })
    this.c = client
    this.subjects = [
      {
        name: 'How to move around the map',
        desc: `To move around the map you can use the move command, for example; \`${client.settings.bot.prefix}move 123 321\`. (\`${client.settings.bot.prefix}help move\`)`
      },
      {
        name: 'Scouting an area',
        desc: `Scouting allows you to look around an area, whether for cities and other properties of the tile you're on. Just do \`${client.settings.bot.prefix}scout\` (\`${client.settings.bot.prefix}help scout\`)`
      },
      {
        name: 'Creating a city',
        desc: `Settling a tile is as simple as doing \`${client.settings.bot.prefix}settle {name}\`. (\`${client.settings.bot.prefix}help settle\`)`
      }, {
        name: 'Configuring your city',
        desc: `A simple to use and understandable menu to change things in the city. \`${client.settings.bot.prefix}city {city name}\` (\`${client.settings.bot.prefix}help city\`)`
      }
    ]
  }

  async run (message, args) {
    const embed = this.c.em(message)
      .setTitle('Getting Started')
      .setDescription(`Welcome to Conquest bot and the world of Serenwyn! These are a few things you'll need to play.\nBe sure to use the \`${this.c.settings.bot.prefix}help\` command.`)
    this.subjects.forEach(x => {
      embed.addField(x.name, x.desc)
    })

    message.channel.send(embed)
  }
}

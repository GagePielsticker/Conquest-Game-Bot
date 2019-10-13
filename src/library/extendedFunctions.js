module.exports = client => {
  /**
     * Dependencies
     */
  const fs = require('fs')
  const moment = require('moment')

  /**
     * Pretty Logging Outputs
     * @param {String} String
     */
  const chalk = require('chalk')
  client.log = string => console.log(`${chalk.green(moment().format('MMMM Do YYYY, h:mm:ss a'))} :: ${string}`)

  /**
     * Reloads commands into the commands array
     */
  client.reloadCommands = () => {
    return new Promise(async (resolve, reject) => {
      client.commands = [] // empty / setup commands array
      await fs.readdir(__dirname + '/../commands/', (err, files) => {
        if (err) return reject(`Error loading command files: ${err}`)
        files.forEach(folder => {
          fs.readdir(`${__dirname}/../commands/${folder}/`, (err, commands) => {
            commands.forEach(cmd => require(`${__dirname}/../commands/${folder}/${cmd}`).load(client))
          })
        })
      })
      await resolve()
    })
  }

  /**
     * Executes Command, requires message object
     * @param {Object} message
     */
  client.executeCommand = message => {
    return new Promise((resolve, reject) => {
      client.commands.forEach(async command => {
        if (command.name.toLowerCase() === message.content.split(' ')[0].toLowerCase().replace(client.settings.bot.prefix, '')) {
          // if there is a required account check
          if (command.hasAccountCheck) {
            const entry = client.database.collection('users').findOne({ uid: message.author.id })
            if (entry == null) return reject('User does not have a game account created.')
          }
          // check if user has designated role for command
          if (command.requiredPermission != null) {
            if (!message.member.permissions.has(command.requiredPermission)) return reject('User does not have permissions to use command.')
          }

          // runs command
          command.run(message) // this line runs the command, put any checks above it and reject on errors
          resolve()
        }
      })
    })
  }

  /**
     * Creates an error discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     * @param {Object} edit Message to edit, if supplied will be editted rather than sent to channel.
     */
  client.sendError = (message, string, edit) => {
    const embed = new client.discord.MessageEmbed()
      .setTitle(':x: Error')
      .setDescription(`${string}`)
      .setFooter(`${message.author.tag}`)
      .setTimestamp()
      .setColor(client.settings.bot.embedColor)
    if (edit) return edit.edit(embed)
    message.channel.send(embed)
  }

  /**
     * Creates a success discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     */
  client.sendSuccess = (message, string) => {
    const embed = new client.discord.MessageEmbed()
      .setTitle(':white_check_mark: Success')
      .setDescription(`${string}`)
      .setFooter(`${message.author.tag}`)
      .setTimestamp()
      .setColor(client.settings.bot.embedColor)
    message.channel.send(embed)
  }

  /**
   * Creates confirm with emojis n stuff
   * @param {Object} ogmsg Invoking message
   * @param {Object} message Message to create confirm on
   * @param {Object} fn obj of functions to run
   * @param {Function} fn.yes Ran when responded yes
   * @param {Function} fn.no Ran when responded no
   * @param {Function} fn.notime Ran when user runs out of time
   */
  client.confirm = async (ogmsg, message, fn) => {
    message.react(client.emoji.yes)
    message.react(client.emoji.no)
    const reactions = await message.awaitReactions(
      (reaction, user) => user.equals(ogmsg.author) && [client.emoji.yes.id, client.emoji.no.id].includes(reaction._emoji.id),
      {
        max: 1,
        time: 30000
      }
    )

    message.reactions.removeAll()

    const reaction = reactions.first()
    if (!reaction) return fn.notime()
    const emoji = reaction.emoji
    if (emoji.id !== client.emoji.yes.id) return fn.no()
    return fn.yes()
  }
}

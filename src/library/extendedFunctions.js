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
      client.commands.clear()
      await fs.readdir(__dirname + '/../commands/', (err, files) => {
        if (err) return reject(`Error loading command files: ${err}`)
        files.forEach(folder => {
          if (folder.endsWith('.js')) return
          fs.readdir(`${__dirname}/../commands/${folder}/`, (err, commands) => {
            if (err) reject(err)
            commands.forEach(cmd => {
              const Command = require(`${__dirname}/../commands/${folder}/${cmd}`)
              client.commands.set(cmd, new Command(client))
            })
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
  client.executeCommand = async message => {
    const args = message.content.slice(client.settings.bot.prefix.length).split(' ')
    const command = args.shift().toLowerCase()
    const cmd = client.commands.find(x => x.name === command || x.aliases.includes(command))
    if (!cmd) return

    if (cmd.accountCheck) {
      const account = await client.database.collection('users').findOne({ uid: message.author.id })
      if (!account) return
    }

    if (cmd.requiredPermission && !message.member.hasPermission(cmd.requiredPermission)) return

    cmd.run(message, args)
  }

  // client.commands.forEach(async command => {
  //   if (command.name.toLowerCase() === message.content.split(' ')[0].toLowerCase().replace(client.settings.bot.prefix, '')) {
  //     // if there is a required account check
  //     if (command.hasAccountCheck) {
  //       const entry = await client.database.collection('users').findOne({ uid: message.author.id })
  //       if (entry == null) return reject('User does not have a game account created.')
  //     }
  //     // check if user has designated role for command
  //     if (command.requiredPermission != null) {
  //       if (!message.member.permissions.has(command.requiredPermission)) return reject('User does not have permissions to use command.')
  //     }

  //     // runs command
  //     command.run(message) // this line runs the command, put any checks above it and reject on errors
  //     resolve()
  //   }
  // })

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

  client.reactMenu = async (message, invoke, stuff) => {
    const emojis = stuff.map(x => x.emoji.id || x.emoji)

    emojis.forEach(x => invoke.react(x))
    const react = await invoke.awaitReactions(
      (reaction, user) => user.equals(message.author) && (emojis.includes(reaction._emoji.id) || emojis.includes(reaction._emoji.name)),
      {
        max: 1,
        time: 30000
      }
    )
    invoke.reactions.removeAll()
    const reaction = react.first()
    if (!reaction) client.sendError(message, 'Ran out of time', invoke)
    const emoji = reaction.emoji
    const response = stuff.find(x => [emoji.id, emoji.name].includes(x.emoji) || [emoji.id, emoji.name].includes(x.emoji.id))
    if (!response) return client.sendError(message, 'Invalid response', invoke)
    response.fn()
  }

  client.messageMenu = async (message, invoke) => {
    const response = await message.channel.awaitMessages(
      (m) => m.author.equals(message.author),
      {
        max: 1,
        time: 30000
      }
    )
    const msg = response.first()
    if (!msg) {
      client.sendError(message, 'Ran out of time', invoke)
      return false
    }
    msg.delete()
    return msg.content
  }
}

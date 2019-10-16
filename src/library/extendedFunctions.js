module.exports = client => {
  /**
     * Dependencies
     */
  const fs = require('fs')
  const moment = require('moment')
  const path = require('path')

  /**
     * Pretty Logging Outputs
     * @param {String} String
     */
  const chalk = require('chalk')
  client.log = string => console.log(`${chalk.green(moment().format('MMMM Do YYYY, h:mm:ss a'))} :: ${string}`)

  const promiseReaddir = (dir) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) return reject(err)
        resolve(files)
      })
    })
  }

  /**
     * Reloads commands into the commands array
     */
  client.reloadCommands = async () => {
    const promises = []
    let cmdFolders = promiseReaddir(path.resolve(__dirname, '../commands')).catch(client.log)
    promises.push(cmdFolders)
    cmdFolders = await cmdFolders
    cmdFolders.forEach(async folder => {
      if (folder.endsWith('.js')) return
      let commands = promiseReaddir(path.resolve(__dirname, '../commands', folder)).catch(client.log)
      promises.push(commands)
      commands = await commands
      commands.forEach(cmd => {
        const Command = require(path.resolve(__dirname, '../commands', folder, cmd))
        client.commands.set(cmd, new Command(client))
      })
    })

    await Promise.all(promises)
      .then(() => {
        client.log('Loaded all commands')
      })
      .catch(err => {
        client.log('Error while loading commands; ' + err)
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
      if (!account) return client.sendError(message, `You don't have an account! Do \`${client.settings.bot.prefix}start\` to get started!`)
    }

    if (cmd.requiredPermission && !message.member.hasPermission(cmd.requiredPermission)) return

    cmd.run(message, args)
  }

  /**
     * Creates an error discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     * @param {Object} edit Message to edit, if supplied will be editted rather than sent to channel.
     */
  client.sendError = (message, string, edit) => {
    const embed = client.em(message)
      .setTitle(':x: Error')
      .setDescription(`${string}`)
    if (edit) return edit.edit(embed)
    message.channel.send(embed)
  }

  /**
     * Creates a success discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     */
  client.sendSuccess = (message, string) => {
    const embed = client.em(message)
      .setTitle(':white_check_mark: Success')
      .setDescription(`${string}`)
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

  client.em = (msg) => {
    return new client.discord.MessageEmbed()
      .setColor(client.settings.bot.embedColor)
      .setFooter(msg.author.tag)
      .setTimestamp()
  }
}

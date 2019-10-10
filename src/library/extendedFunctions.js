module.exports = client => {
  /**
     * Dependencies
     */
  const fs = require('fs')

  /**
     * Pretty Logging Outputs
     * @param {String} String
     */
  const chalk = require('chalk')
  client.log = string => console.log(`${chalk.green(client.moment().format('MMMM Do YYYY, h:mm:ss a'))} :: ${string}`)

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
     */
  client.sendError = (message, string) => {
    const embed = new client.discord.MessageEmbed()
      .setTitle(':x: Error')
      .setDescription(`${string}`)
      .setFooter(`${message.author.username}#${message.author.discriminator}`)
      .setTimestamp()
      .setColor(client.settings.bot.embedColor)
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
      .setFooter(`${message.author.username}#${message.author.discriminator}`)
      .setTimestamp()
      .setColor(client.settings.bot.embedColor)
    message.channel.send(embed)
  }
}

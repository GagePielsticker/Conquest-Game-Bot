module.exports.load = client => {
  const humanizeDuration = require('humanize-duration')
  const moment = require('moment')

  const command = {
    name: 'Move',
    category: 'game',
    description: 'Move to a location',
    usage: `${client.settings.bot.prefix}move {x} {y}`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const cooldown = client.game.movementCooldown.has(message.author.id)
      if (cooldown) return client.sendError(message, `You're already moving, wait ${humanizeDuration(cooldown.endTime - moment().unix())}`)

      let { 0: newX, 1: newY } = message.content.split(' ').splice(1)
      if (!newX || !newY) return client.sendError(message, `Missing X or Y, do ${client.settings.bot.prefix}move {x} {y}`)

      if (isNaN(newX)) return client.sendError(message, 'Invalid X')
      if (isNaN(newY)) return client.sendError(message, 'Invalid Y')

      newX = Number(newX)
      newY = Number(newY)

      const user = await client.database.collection('users').findOne({ uid: message.author.id })
      const timeToMove = await client.game.calculateTravelTime(user.xPos, user.yPos, newX, newY)

      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle('Confirm movement')
          .addField('From tile', `X: \`${user.xPos}\`, Y: \`${user.yPos}\``, true)
          .addField('To tile', `X: \`${newX}\`, Y: \`${newY}\``)
          .addField('Will Take', `\`${humanizeDuration(timeToMove)}\``)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
        .then(msg => {
          client.confirm(message, msg, {
            no: () => {
              msg.edit(
                new client.discord.MessageEmbed()
                  .setColor('RED')
                  .setTitle('Cancelled Movement')
                  .setFooter(message.author.tag)
                  .setTimestamp()
              )
            },
            notime: () => {
              client.sendError(message, 'Ran out of time, cancelled', msg)
            },
            yes: () => {
              client.game.moveUser(message.author.id, newX, newY)
                .then((time) => {
                  if (message.content.match(/-d/) && client.beta) time = 1000
                  msg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle('Moving!')
                      .setDescription(`Now moving to tile: X: \`${newX}\`, Y: \`${newY}\`\n\nYou will be pinged here when you have finished moving!`)
                      .addField('Will be done in', `\`${humanizeDuration(time)}\``)
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  )
                  setTimeout(() => {
                    message.reply(
                      new client.discord.MessageEmbed()
                        .setColor(client.settings.bot.embedColor)
                        .setTitle('Moved!')
                        .setDescription(`Your new location is X: \`${newX}\` \`${newY}\``)
                        .setFooter(message.author.tag)
                        .setTimestamp()
                    )
                  }, time)
                })
                .catch(e => client.sendError(message, e))
            }
          })
        })
    }
  }

  client.commands.push(command)
}

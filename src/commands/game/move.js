const Command = require('../command.js')
const humanizeDuration = require('humanize-duration')
const moment = require('moment')

module.exports = class MoveCommand extends Command {
  constructor (client) {
    super('move', ['m'], 'Move to a location', {
      usage: `${client.settings.bot.prefix}move {x} {y}`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
    this.timeouts = new Map()

    client.subWS.off('STOP_USER', (data) => {
      this.handleStopUser(data)
    })

    client.subWS.on('STOP_USER', (data) => {
      this.handleStopUser(data)
    })
  }

  handleStopUser (data) {
    const timeout = this.timeouts.get(data.user)
    if (!timeout) return
    clearTimeout(timeout)
    this.timeouts.delete(data.user)
  }

  async run (message, args) {
    const cooldown = this.c.game.movementCooldown.has(message.author.id)
    if (cooldown) return this.c.sendError(message, `You're already moving, wait ${humanizeDuration(cooldown.endTime - moment().unix())}`)

    let { 0: newX, 1: newY } = args
    if (!newX || !newY) return this.c.sendError(message, `Missing X or Y, do ${this.c.settings.bot.prefix}move {x} {y}`)

    if (isNaN(newX)) return this.c.sendError(message, 'Invalid X')
    if (isNaN(newY)) return this.c.sendError(message, 'Invalid Y')

    newX = Number(newX)
    newY = Number(newY)

    newX = newX.toFixed(0)
    newY = newY.toFixed(0)

    const user = await this.c.game.getUser(message.author.id)
    const timeToMove = await this.c.game.calculateTravelTime(user.xPos, user.yPos, newX, newY)

    message.channel.send(
      this.c.em(message)
        .setColor(this.c.settings.bot.embedColor)
        .setTitle('Confirm movement')
        .addField('From tile', `X: \`${user.xPos}\`, Y: \`${user.yPos}\``, true)
        .addField('To tile', `X: \`${newX}\`, Y: \`${newY}\``)
        .addField('Will Take', `\`${humanizeDuration(timeToMove)}\``)
        .setFooter(message.author.tag)
        .setTimestamp()
    )
      .then(msg => {
        this.c.confirm(message, msg, {
          no: () => {
            msg.edit(
              this.c.em(message)
                .setTitle('Cancelled Movement')
            )
          },
          notime: () => {
            this.c.sendError(message, 'Ran out of time, cancelled', msg)
          },
          yes: async () => {
            await msg.edit(this.c.loadingEmbed(message))
            this.c.game.moveUser(message.author.id, newX, newY)
              .then((time) => {
                if (message.content.match(/-d/) && this.c.dev) time = 1000
                msg.edit(
                  this.c.em(message)
                    .setTitle('Moving!')
                    .setDescription(`Now moving to tile: X: \`${newX}\`, Y: \`${newY}\``/* \n\nYou will be pinged here when you have finished moving!` */)
                    .addField('Will be done in', `\`${humanizeDuration(time)}\``)
                )
                const timeout = setTimeout(() => {
                  message.reply(
                    this.c.em(message)
                      .setTitle('Moved!')
                      .setDescription(`Your new location is X: \`${newX}\` \`${newY}\``)
                  )
                }, time)
                this.timeouts.set(message.author.id, timeout)
              })
              .catch(e => this.c.sendError(message, e, msg))
          }
        })
      })
  }
}

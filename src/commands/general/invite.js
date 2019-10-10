module.exports.load = client => {
  const command = {
    name: 'Invite',
    category: 'general',
    description: 'Invites the bot to the server.',
    usage: `${client.settings.bot.prefix}invite`,
    requiredPermission: null,
    hasAccountCheck: false,

    run (message) {
      message.reply(`You can invite me to your guild here, ${client.settings.bot.inviteURL}`)
    }
  }

  client.commands.push(command)
}

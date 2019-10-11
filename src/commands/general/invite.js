module.exports.load = client => {
  const command = {
    name: 'Invite',
    category: 'general',
    description: 'Invites the bot to the server.',
    usage: `${client.settings.bot.prefix}invite`,
    requiredPermission: null,
    hasAccountCheck: false,

    run (message) {
      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle(':mailbox_with_mail: Invite')
          .setDescription(`Invite the bot [here](${client.settings.bot.inviteURL}!`)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
    }
  }

  client.commands.push(command)
}

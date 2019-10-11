module.exports.load = client => {
  const command = {
    name: 'Bal',
    category: 'game',
    description: 'Quick view the users balance.',
    usage: `${client.settings.bot.prefix}bal`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const entry = await client.database.collection('users').findOne({ uid: message.author.id })
      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle(':moneybag: Balance')
          .setDescription(`\`${entry.gold.toLocaleString()}\` gold`)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
    }
  }

  client.commands.push(command)
}

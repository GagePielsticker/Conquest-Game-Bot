module.exports.load = client => {
  const command = {
    name: 'Set',
    category: 'game',
    description: 'Setttings',
    usage: `${client.settings.bot.prefix}set {setting}`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const setting = message.content.split(' ').splice(1)[0].toLowerCase()
      if (setting === 'city') {
        const { 1: currentName, 2: newName } = message.content.split(' ').splice(1)
        if (!currentName || !newName) return client.sendError(message, `Missing argument, do ${client.settings.bot.prefix}set city {old-name} {new-name}`)
        const currentCity = await client.database.collection('map').findOne({ 'city.name': currentName, 'city.owner': message.author.id })
        if (!currentCity) return client.sendError(message, 'City was not found / you don\'t own it!')
        client.game.setCityName(message.author.id, currentCity.xPos, currentCity.yPos, newName)
          .then(() => {
            client.sendSuccess(message, `Set city name from \`${currentCity.city.name}\` to \`${newName}\``)
          })
          .catch(e => client.sendError(message, e))
      } else if (setting === 'empire') {
        const newName = message.content.split(' ').splice(1)[1]
        if (!newName) return client.sendError(message, `Missing argument, do ${client.settings.bot.prefix}set empire {empire-name}`)
        client.game.setEmpireName(message.author.id, newName)
          .then(() => {
            client.sendSuccess(message, `Set your empire name to \`${newName}\`!`)
          })
          .catch(e => client.sendError(message, e))
      } else {
        client.sendError(message, `Invalid setting \`${setting}\`\n\nChoose from: \`city\`, \`empire\``)
      }
    }
  }

  client.commands.push(command)
}

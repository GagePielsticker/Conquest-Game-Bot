module.exports.load = client => {
  const command = {
    name: 'Set',
    category: 'game',
    description: 'Set\'s the name of a city.',
    usage: `${client.settings.bot.prefix}set {old-name} {new-name}`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const { 0: currentName, 1: newName } = message.content.split(' ').splice(1)
      if (!currentName || !newName) return client.sendError(message, `Missing argument, do ${client.settings.bot.prefix}set {old-name} {new-name}`)
      const currentCity = await client.database.collection('map').findOne({ 'city.name': currentName, 'city.owner': message.author.id })
      if (!currentCity) return client.sendError(message, 'City was not found / you don\'t own it!')
      client.game.setCityName(message.author.id, currentCity.xPos, currentCity.yPos, newName)
        .then(() => {
          client.sendSuccess(message, `Set city name from \`${currentCity.city.name}\` to \`${newName}\``)
        })
        .catch(e => client.sendError(message, e))
    }
  }

  client.commands.push(command)
}

module.exports.load = client => {
    const command = {
      name: 'Start',
      category: 'game',
      description: 'Create a user account for the game.',
      usage: `${client.settings.bot.prefix}start`,
      requiredPermission: null,
      hasAccountCheck: false,
  
      async run (message) {
          client.game.createUser(message.author.id)
          .then(() => client.sendSuccess(message, 'You have successfully created an account!'))
          .catch(e => client.sendError(message, e))
      }
    }
  
    client.commands.push(command)
  }
  
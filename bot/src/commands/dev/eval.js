module.exports.load = client => {
  /**
     * The command object holds execution functionality and settings for the command
     */
  const command = {
    name: 'Eval',
    description: 'Evaluates code for developers',
    usage: 'eval {code block}',
    requiredPermission: null,
    hasAccountCheck: false,

    async run (message) {
      if (!client.settings.bot.developers.includes(message.author.id)) return
      const clean = text => {
        if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
      }
      try {
        const code = message.content.split(' ').splice(1).join(' ')
        let evaled = eval(code)
        if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }
        message.channel.send(clean(evaled), { code: 'xl' })
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
      }
    }
  }

  /**
     * Append to the commands array
     */
  client.commands.push(command)
}

const Command = require('../command.js')

module.exports = class EvalCommand extends Command {
  constructor (client) {
    super('eval', ['e'], 'Evaluates code for developers', {
      usage: `${client.settings.bot.prefix}eval {code block}`,
      accountCheck: false,
      requiredPermission: null,
      category: 'dev'
    })
    this.c = client
  }

  async run (message, args) {
    if (!this.c.settings.bot.developers.includes(message.author.id)) return
    const clean = text => {
      if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
    }
    try {
      const code = args.join(' ')
      const client = this.c // eslint-disable-line no-unused-vars
      let evaled = eval(code) // eslint-disable-line no-eval
      if (evaled.then) evaled = await evaled
      if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }
      message.channel.send(clean(evaled), { code: 'xl' })
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
    }
  }
}

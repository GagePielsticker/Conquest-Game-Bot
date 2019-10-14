module.exports = class Command {
  constructor (name, aliases, description, opts) {
    this.usage = opts.usage || ''
    this.accountCheck = opts.accountCheck || false
    this.requirePermission = opts.requirePermission || null
    this.category = opts.category || 'general'

    this.name = name
    this.aliases = aliases
    this.description = description
  }
}

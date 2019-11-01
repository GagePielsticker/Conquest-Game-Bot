module.exports = client => {
  /**
     * Get required lib
     */
  const DBL = require('dblapi.js')
  const dbl = new DBL(client.settings.dbl.token, client)

  /**
     * Handle DBL POSTED event
     */
  dbl.on('posted', () => {
    client.log('Server count posted!')
  })

  /**
   * Post stats to our api every 30 mins
   */
  setInterval(() => {
    client.game.postStats(client.guilds.size, client.users.size)
  }, 1800000)
}

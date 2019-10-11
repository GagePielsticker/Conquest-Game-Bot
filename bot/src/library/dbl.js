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
}

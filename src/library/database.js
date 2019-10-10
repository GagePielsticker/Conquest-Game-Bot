module.exports = client => {
  /**
     * Dependencies
     */
  const MongoClient = require('mongodb').MongoClient

  /**
     * Connects mongoDB Database and appends it on client.db
     */
  client.connectDb = () => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(client.settings.database.mongodbURL, { useNewUrlParser: true }, async (err, data) => {
        client.database = await data.db(client.settings.database.databaseName)
        if (err) return reject(`Error connecting to db: ${err}`)
        else await resolve()
      })
    })
  }
}

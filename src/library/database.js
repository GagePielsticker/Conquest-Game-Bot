module.exports = client => {

    /**
     * Extended functions dependencies
     */
    let MongoClient = require('mongodb').MongoClient

    /**
     * Connects mongoDB Database and appends it on client.db
     */
    client.connectDb = () => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(client.settings.bot.mongodbURL, {useNewUrlParser: true}, async (err, data) => {
                client.database = await data.db('conquest')
                if(err) return reject(`Error connecting to db: ${err}`)
                else await resolve()
            })
        })
}
}
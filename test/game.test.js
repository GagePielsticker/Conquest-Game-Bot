/* setup empty client and dependencies*/
let client = {}

const MongoClient = require('mongodb').MongoClient
client.settings = require('../src/settings/settings.json')

/* setup database connection */
client.database = MongoClient.connect(`mongodb://${client.settings.database.username ? `${client.settings.database.username}:${client.settings.database.password}@` : ''}${client.settings.database.host}:${client.settings.database.port}`, { useNewUrlParser: true }, async (err, data) => {
    return await data.db(client.settings.database.database + '_test')
})

/* get the game library on client */

test('User object can be created and read in database', async () => {
    await client.game.createUser(client.user.id)
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    expect(entry).not.toBe(null)
})

/* setup fake user for testing */
client.user = {
    id: 123
}


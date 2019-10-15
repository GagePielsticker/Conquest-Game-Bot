/* setup empty client and dependencies*/
let client = {}

const MongoClient = require('mongodb').MongoClient
client.settings = require('../src/settings/settings.json')

/* setup fake user for testing */
client.user = {
    id: 123
}

/* before all setup database */
beforeAll(async () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(`mongodb://${client.settings.database.username ? `${client.settings.database.username}:${client.settings.database.password}@` : ''}${client.settings.database.host}:${client.settings.database.port}`, { useNewUrlParser: true }, async (err, data) => {
            client.database = data.db(client.settings.database.database + '_test')
            setTimeout(() => {resolve()}, 500)
        })
    })
})

/* get the game library on client */
require('../src/library/game.js')(client)

test('User object can be created and read in database', async () => {
    await client.game.createUser(client.user.id)
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    expect(entry).not.toBe(null)
})


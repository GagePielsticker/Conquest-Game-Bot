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

            /* make sure both databases are empty */
            client.database.collection('users').remove({})
            client.database.collection('map').remove({})

            resolve()
        })
    })
})

/* Get the game library on client */
require('../src/library/game.js')(client)

/** Begin unit test */
test('User object can be created and read in database', async () => {
    await client.game.createUser(client.user.id)
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    expect(entry).not.toBe(null)
})

test('Check tile Created where user spawns', async () => {
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    let map = await client.database.collection('users').findOne({xPos:entry.xPos, yPos:entry.yPos})
    expect(map).not.toBe(null)
})

test('Check manual tile creation', async () => {
    await client.game.createTile(0, 0)
    let map = await client.database.collection('map').findOne({xPos:0, yPos:0})
    expect(map).not.toBe(null)
})

test('Check calculate time function', async () => {
    let time = await client.game.calculateTravelTime(1, 1, 2, 2)

    // Calculate time
    const a = 1 - 2
    const b = 1 - 2
    const distance = Math.sqrt(a * a + b * b)
    let checkTime = distance * 10

    expect(time).toBe(Math.floor(checkTime * 1000))
})

test('user settling works', async () => {
    await client.game.settleLocation(client.user.id, 'test')
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    let map = await client.database.collection('users').findOne({xPos:entry.xPos, yPos:entry.yPos}) 

    expect(entry.cities.length).not.toBe(0)
    expect(map.city).not.toBe(null)
})

test('user can set flag url', async () => {
    await client.game.setFlag(client.user.id, 'test')
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    expect(entry.flagURL).toBe('test')
})

test('user can set empire name', async () => {
    await client.game.setEmpireName(client.user.id, 'test')
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    expect(entry.empireName).toBe('test')
})

test('user can set city name', async () => {
    let entry = await client.database.collection('users').findOne({uid:client.user.id})
    await client.game.setCityName(client.user.id, entry.xPos, entry.yPos, 'newName')

    let newEntry = await client.database.collection('users').findOne({uid:client.user.id})
    let map = await client.database.collection('map').findOne({xPos:entry.xPos, yPos:entry.yPos})

    expect(newEntry.cities[0].name).toBe('newName')
    expect(map.city.name).toBe('newName')
})

test('user can calculate level cost', async () => {
    let checkCost = await client.game.calculateLevelCost(5)

    const power = Math.pow(1.63068, 5 + 1)
    const cost = Math.floor(3760.60309 * power)

    expect(checkCost).toBe(cost)
})

test('user can calculate max population', async () => {
    let checkPop = await client.game.calculateMaxPopulation(5)

    let pop = 5 * 1000

    expect(checkPop).toBe(pop)
})


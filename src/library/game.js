module.exports = client => {

    /**
     * Extended functions dependencies
     */
    client.game = {}
    client.game.cooldowns = {}
    client.game.cooldowns.collector = []

    /**
     * Creates game account for user
     * @param {String} did
     */
    client.game.createUser = did => {
        return new Promise((resolve, reject) => {
            //Create user object in database
            client.database.collection('users').update({id:did}, {
                id:did,
                race: null,
                role: null,
                gold: 0,
                stats: {
                    level: 1,
                    health: 0,
                    attack: 0,
                    defense: 0,
                    magic: 0,
                    range: 0,
                    prayer: 0,
                    intellect: 0,
                    charisma: 0,
                    dexterity: 0
                },
                finishedCreation: false
            }, {upsert:true})
            .then(async () => {
                let profile = await client.users.fetch(did, true)
                client.log(`Created user for ${profile.username}#${profile.discriminator}`)
                resolve()
            })
        })
    }

    /**
     * Sets a users role to whatever is input
     * @param {String} did
     * @param {String} role
     */
    client.game.setUserRole = (did, role) => {
        return new Promise(async (resolve, reject) => {
            
            //load user profile
            let profile = client.database.collection('users').findOne({id: did})

            //check if they already have a role
            if(profile.role != null) return reject('User already has a class selected.')

            //check if its a valid role
            let exist = false
            await client.settings.game.roles.forEach(entry => {
                if(entry.name === role.toLowerCase()) exist = true
            })
            if(!exist) return reject('Class does not exist.')

            //set profiles class
            await client.database.collection('users').updateOne({id: did}, {$set:{role:role.toLowerCase()}})
            .then(resolve())
            .catch(e => reject('Error saving data.'))
        })
    }

    /**
     * Sets a users race to whatever is input
     * @param {String} did
     * @param {String} race
     */
    client.game.setUserRace = (did, race) => {
        return new Promise(async (resolve, reject) => {
            
            //load user profile
            let profile = await client.database.collection('users').findOne({id: did})

            //check if they already have a race
            if(profile.race != null) return reject('User already has a race selected.')

            //check if its a valid race
            let selectedRace = {}
            await client.settings.game.races.forEach(entry => {
                if(entry.name === race.toLowerCase()) selectedRace = entry
            })
            if(!selectedRace.name) return reject('Race does not exist.')

            //add racial buffs
            profile.race = selectedRace.name
            profile.stats.health += selectedRace.baseHealth
            profile.stats.attack += selectedRace.baseAttack
            profile.stats.defense += selectedRace.baseDefense
            profile.stats.magic += selectedRace.baseMagic
            profile.stats.range += selectedRace.baseRange
            profile.stats.prayer += selectedRace.basePrayer
            profile.stats.intellect += selectedRace.baseIntellect
            profile.stats.charisma += selectedRace.baseCharisma
            profile.stats.dexterity += selectedRace.baseDexterity

            //write user data
            await client.database.collection('users').update({id:did}, profile)

            //resolve
            await resolve()
        })
    }
}
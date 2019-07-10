module.exports.load = client => {

    const command = {
        name: 'begin',
        description: 'Create a game account.',
        usage: 'begin',
        waitForAccount: false,
        
        async run(message) {
            
            //get profile
            let profile = await client.database.collection('users').findOne({id: message.author.id})

            //check to see what stage they are in
            if(profile.race != null && profile.role != null) return client.sendError(message, 'You already have made an account.')
            if(profile.race != null && profile.role == null) pickRole() 
            if(profile.race == null) pickRace()

            //race picking logic
            function pickRace() {
                let output = []
                let i = 1;
                client.settings.game.races.forEach(ent => { 
                    output.push(`${ent.name}`)
                    i++
                })
                client.sendCheck(message, `Race Selection`, `To continue please reply with one of the following.\n\`\`\`${output.join('\n')}\`\`\``)
                const collector = new client.discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: client.settings.collectorTimeout * 1000 })
                collector.on('collect', message => {
                    client.game.setUserRace(message.author.id, message.content)
                    .then(() => pickRole())
                    .catch(e => client.sendError(message, e))
                        client.game.cooldowns.collector.splice(client.game.cooldowns.collector.indexOf(message.author.id), 1)
                    collector.stop()
                })
            }

            //Role picking logic
            function pickRole() {
                let output = []
                let i = 1;
                client.settings.game.roles.forEach(ent => { 
                    output.push(`${ent.name}`)
                    i++
                })
                client.sendCheck(message, `Role Selection`, `To continue please reply with one of the following.\n\`\`\`${output.join('\n')}\`\`\``)
                const collector = new client.discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: client.settings.collectorTimeout * 1000 })
                collector.on('collect', message => {
                    client.game.setUserRole(message.author.id, message.content)
                    .then(() => {
                        client.sendSuccess(message, 'Finished setting up account!')
                        client.database.collection('users').updateOne({id: message.author.id}, {$set:{finishedCreation:true}})
                    })
                    .catch(e => client.sendError(message, e))
                        client.game.cooldowns.collector.splice(client.game.cooldowns.collector.indexOf(message.author.id), 1)
                    collector.stop()
                })
            }
        }
    }

    client.commands.push(command)
}
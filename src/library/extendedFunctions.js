module.exports = client => {
    
    /**
     * Extended functions dependencies
     */
    const fs = require('fs')
    
    /**
     * Pretty Logging Outputs
     * @param {String} String
     */
    client.log = string => console.log(`${client.moment().format('MMMM Do YYYY, h:mm:ss a')} :: ${string}`)

    /**
     * Reloads commands into the commands array
     */
    client.reloadCommands = () => {
        return new Promise(async (resolve, reject) => {
            await fs.readdir(__dirname + '/../commands/', (err, files) => {
                if(err) return reject(`Error loading command files: ${err}`)
                files.forEach(folder => {
                    fs.readdir(`${__dirname}/../commands/${folder}/`, (err, commands) => {
                        commands.forEach(cmd => require(`${__dirname}/../commands/${folder}/${cmd}`).load(client))
                    })
                })
            })
            await resolve()
        })
    }

    /**
     * Executes Command, requires message object
     * @param {Object} message
     */
    client.executeCommand = message => {
        return new Promise(async (resolve, reject) => {
            let commandName = message.content.split(' ')[0].replace(client.settings.bot.prefix, '')
            let entry = await client.database.collection('users').findOne({id:message.author.id})
            if(entry === null) await client.game.createUser(message.author.id)
            await client.commands.forEach(command => {
                if(command.name.toLowerCase() === commandName.toLowerCase()) {
                    if(command.waitForAccount && !entry.finishedCreation) {
                        reject(`You must create an account with \`${client.settings.bot.prefix}begin\``)
                    } else {
                        command.run(message)
                        resolve()   
                    }
                }
            })
        })
    }

    /**
     * Creates an error discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     */
    client.sendError = (message, string) => {
        let embed = new client.discord.MessageEmbed()
        .setTitle('Error')
        .setDescription(`${string}`)
        .setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
        .setTimestamp()
        .setColor(client.settings.bot.embedColor)
        message.channel.send(embed)
    }

    /**
     * Creates a success discord embed and sends
     * @param {Object} message Discords message event fire
     * @param {String} string
     */
    client.sendSuccess = (message, string) => {
        let embed = new client.discord.MessageEmbed()
        .setTitle('Success')
        .setDescription(`${string}`)
        .setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
        .setTimestamp()
        .setColor(client.settings.bot.embedColor)
        message.channel.send(embed)
    }

    /**
     * Creates a check discord embed, sends, and adds them to cooldown. ONLY FOR COLLECTOR CHECKS
     * @param {Object} message Discords message event fire
     * @param {String} string
     */
    client.sendCheck = (message, title, string) => {

        //create verification embed and send
        let embed = new client.discord.MessageEmbed()
        .setTitle(title)
        .setDescription(`${string}`)
        .setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
        .setTimestamp()
        .setColor(client.settings.bot.embedColor)
        message.channel.send(embed)

        //Add user to collector cooldown and auto remove after timeout
        client.game.cooldowns.collector.push(message.author.id)
        setTimeout(() => {
            client.game.cooldowns.collector.splice(client.game.cooldowns.collector.indexOf(message.author.id), 1)
        }, client.settings.collectorTimeout * 1000)
}
}
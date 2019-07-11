module.exports.load = client => {

    const command = {
        name: 'stats',
        description: 'View character statistics.',
        usage: 'stats',
        waitForAccount: true,
        
        async run(message) {
            let profile = await client.database.collection('users').findOne({id:message.author.id})
            let embed = await new client.discord.MessageEmbed()
            embed.setTitle('Stats')
            embed.addField('Level', `\`${profile.stats.level}\``, true)
            embed.addField('xPos', `\`${profile.xPos}\``, true)
            embed.addField('yPos', `\`${profile.yPos}\``, true)
            embed.addField('Race', `\`${profile.race}\``, true)
            embed.addField('Role', `\`${profile.role}\``, true)
            embed.addField('Gold', `\`${profile.gold}\``, true)
            embed.addField('Health', `\`${profile.stats.health}/${profile.stats.maxHealth}\``, true)
            embed.addField('Attack', `\`${profile.stats.attack}\``, true)
            embed.addField('Defense', `\`${profile.stats.defense}\``, true)
            embed.addField('Magic', `\`${profile.stats.magic}\``, true)
            embed.addField('Range', `\`${profile.stats.range}\``, true)
            embed.addField('Prayer', `\`${profile.stats.prayer}\``, true)
            embed.addField('Intellect', `\`${profile.stats.intellect}\``, true)
            embed.addField('Charisma', `\`${profile.stats.charisma}\``, true)
            embed.addField('Dexterity', `\`${profile.stats.dexterity}\``, true)
            embed.setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
            embed.setTimestamp()
            embed.setColor(client.settings.embedColor)
            await message.channel.send(embed)
        }
    }

    client.commands.push(command)
}
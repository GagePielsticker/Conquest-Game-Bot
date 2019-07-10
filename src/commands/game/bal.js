module.exports.load = client => {

    const command = {
        name: 'bal',
        description: 'Quick view balance.',
        usage: 'bal',
        waitForAccount: true,
        
        async run(message) {
            let user = await client.database.collection('users').findOne({id:message.author.id})
            let embed = await new client.discord.MessageEmbed()
            embed.setTitle('Balance')
            embed.setDescription(`\`${user.gold.toLocaleString()}\` credits`)
            embed.setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
            embed.setTimestamp()
            embed.setColor(client.settings.embedColor)
            await message.channel.send(embed)
        }
    }

    client.commands.push(command)
}
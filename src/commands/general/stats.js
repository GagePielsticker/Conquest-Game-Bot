module.exports.load = client => {

    const command = {
        name: 'Stats',
        description: 'See bot statistics.',
        usage: 'stats',
        waitForAccount: false,

        run(message) {
            let embed = new client.discord.MessageEmbed()
            .setTitle('Statistics')
            .setDescription(client.settings.bot.botDescription)
            .addField('Users', `\`${client.users.size}\``, true)
            .addField('Guilds', `\`${client.guilds.size}\``, true)
            .addField('Language', '\`NodeJS\`', true)
            .addField('Support Server', `[Click Here](${client.settings.bot.supportServer})`, true)
            .addField('Developer', `uber#0001`, true)
            .setFooter(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
            .setTimestamp()
            .setColor(client.settings.bot.embedColor)
            message.channel.send(embed)
        }
    }

    client.commands.push(command)
}
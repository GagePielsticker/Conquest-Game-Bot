module.exports.load = client => {

    const command = {
        name: 'Invite',
        description: 'Invites the bot to the server.',
        usage: 'invite',
        waitForAccount: false,

        run(message) {
            message.reply(`You can invite me to your guild here, ${client.settings.bot.inviteURL}`)
        }
    }

    client.commands.push(command)
}
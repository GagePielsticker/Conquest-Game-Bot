module.exports = client => {

     /**
      * On bot connection
     */
    client.on('ready', async () => {
        await client.log("Client has started.")
        await client.reloadCommands().catch(e => client.log(e))
        await client.connectDb().then(() => client.log('Connected database'))
        await client.user.setActivity(client.settings.bot.activity) 
    })

    /**
     * Get the message object from client event
     * @param {Object} message
     */
    client.on('message' , async message => {
        if(message.author.bot) return
        if(!message.content.startsWith(client.settings.bot.prefix)) return
        await client.executeCommand(message)
        .catch(e => client.sendError(message, e))
        .then(() => client.log(`${message.author.tag} || ${message.content}`))
    })

    /**
     * Takes shard object on shard ready and outputs.
     * @param {Object} shard shard
     */
    client.on('shardReady', shard => {
        client.log(`Shard Ready : ${shard} | total : ${client.options.shards + 1}`)
    })
}
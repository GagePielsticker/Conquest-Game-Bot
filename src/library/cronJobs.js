module.exports = client => {
  const cron = require('node-cron')

  /** @namespace */
  client.jobs = {

    // create a task list and execute in order to prevent same-time execution
    taskList: [],

    /**
     * Handles Population Decay
     */
    populationJob: cron.schedule('0 */12 * * *', () => {
      taskList.push({
        exec: client.game.consumeFood
      })
    }),

    /**
     * Handles gold Growth
     */
    goldJob: cron.schedule('0 */1 * * *', () => {
      taskList.push({
        exec: client.game.generateGold
      })
    }),

    /**
     * Handles resource Growth
     */
    resourceJob: cron.schedule('0 */5 * * *', () => {
      taskList.push({
        exec: client.game.generateResource
      })
    }),

    /**
     * Handles food Growth
     */
    foodJob: cron.schedule('0 */12 * * *', () => {
      taskList.push({
        exec: client.game.generateFood
      })
    }),

    /**
     * Handles executing the taskList
     */
    eventLoop: setInterval(async () => {
      let userArray
      if (taskList.length > 0) {
        userArray = await client.database.collection('users').find({}).toArray()
      }
      for (let index = 0; index < taskList.length; index++) {
        for (let userIndex = 0; userIndex < userArray.length; userIndex++) {
          await taskList[index].exec(userArray[userIndex].uid)
        }
      }
      client.jobs.taskList = []
    }, 60000)
  }
}

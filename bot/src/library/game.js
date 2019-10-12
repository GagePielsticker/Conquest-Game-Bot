module.exports = client => {
  // get needed libraries
  const Chance = require('chance')
  const chance = new Chance()
  const moment = require('moment')
  const nameGenerator = require('project-name-generator')

  /** @namespace */
  client.game = {

    /**
     * Contains the user id's of everyone currently traveling
     */
    movementCooldown: new Map(),
    scoutCooldown: new Map(),

    /**
      * Create a database object for the guild
      * @param {String} uid a discord user id
     */
    createUser: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry != null) return Promise.reject('User exist in database.')

      // calculate spawn position
      const xPos = Math.floor(Math.random() * (client.settings.game.map.xMax - client.settings.game.map.xMin) + client.settings.game.map.xMin)
      const yPos = Math.floor(Math.random() * (client.settings.game.map.yMax - client.settings.game.map.yMin) + client.settings.game.map.yMin)

      // check if tile exist if not create it
      const mapEntry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (mapEntry == null) await client.game.createTile(xPos, yPos)

      // set default user object
      const userObject = {
        uid: uid,
        xPos: xPos,
        yPos: yPos,
        gold: 200,
        empireName: null,
        flagURL: null,
        hasSettler: true,
        cities: [],
        scoutedTiles: []
      }

      // write object to database
      return client.database.collection('users').insertOne(userObject)
    },

    /**
      * Creates a map tile or something idk
      * @param {Integer} xPos position on map grid
      * @param {Integer} yPos position on map grid
     */
    createTile: async (xPos, yPos) => {
      // check if tile exist
      const entry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (entry != null) return Promise.reject('Map tile exist in database.')

      // set default tile object
      const mapObject = {
        xPos: xPos,
        yPos: yPos,
        city: null,
        hasWonder: false
      }

      // calculate if city and wonder spawns with weighted chance
      const hasNPCCity = chance.weighted([true, false], [15, Math.floor(100 - 15)])
      const hasWonder = chance.weighted([true, false], [5, Math.floor(100 - 5)])

      // if tile has wonder change objects value
      if (hasWonder) mapObject.hasWonder = true

      // if tile has npc city randomly generate one
      if (hasNPCCity) {
        mapObject.city = {
          level: 1,
          xPos: xPos,
          yPos: yPos,
          inStasis: false,
          owner: null,
          name: nameGenerator({ words: 2 }).dashed,
          tradeRoutes: [],
          resources: {
            stone: Math.floor(Math.random() * 11),
            maxStone: 2000,
            metal: Math.floor(Math.random() * 11),
            maxMetal: 2000,
            wood: Math.floor(Math.random() * 11),
            maxWood: 2000,
            food: Math.floor(Math.random() * 30) + 10,
            maxFood: 3000
          },
          population: {
            military: Math.floor(Math.random() * 25) + 1,
            miners: Math.floor(Math.random() * 25) + 1,
            workers: Math.floor(Math.random() * 25) + 1,
            farmers: Math.floor(Math.random() * 25) + 1,
            unemployed: 0
          }
        }
      }

      // write object to database
      return client.database.collection('map').insertOne(mapObject)
    },

    /**
      * Moves user to location
      * @param {String} uid a discord user id
      * @param {Integer} xPos position on map grid
      * @param {Integer} yPos position on map grid
     */
    moveUser: async (uid, xPos, yPos) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const entry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (entry == null) await client.game.createTile(xPos, yPos)

      // check if user is in cooldown
      if (client.game.movementCooldown.has(uid)) return Promise.reject('User is currently Travelling.')

      // check to make sure target is in bounds
      if (xPos > client.settings.game.map.xMax || xPos < client.settings.game.map.xMin) return Promise.reject('Invalid location.')
      if (yPos > client.settings.game.map.yMax || yPos < client.settings.game.map.yMin) return Promise.reject('Invalid location.')

      // calculate travel time to target
      const travelTime = await client.game.calculateTravelTime(userEntry.xPos, userEntry.yPos, xPos, yPos)

      // add user to cooldown array and setup task
      client.game.movementCooldown.set(uid, {
        startTime: moment().unix(),
        endTime: moment().unix() + travelTime
      })

      setTimeout(() => {
        // remove user from cooldown array
        client.game.movementCooldown.delete(uid)

        // move user in database
        client.database.collection('users').updateOne({ uid: uid }, { $set: { xPos: xPos, yPos: yPos } })
      }, travelTime)

      // return resolve that timeout has been set
      return Promise.resolve(travelTime)
    },

    /**
      * Calculates travel time
      * @param {Integer} x1 position on map grid
      * @param {Integer} y1 position on map grid
      * @param {Integer} x2 position on map grid
      * @param {Integer} y2 position on map grid
      * @returns {Integer} in ms
     */
    calculateTravelTime: async (x1, y1, x2, y2) => {
      // distance formula from user to target
      const a = x1 - x2
      const b = y1 - y2
      const distance = Math.sqrt(a * a + b * b)

      // calculate time from distance
      const time = distance * 4

      // return time in milleseconds
      return Promise.resolve(Math.floor(time * 1000))
    },

    /**
      * Settles location of player if settler available
      * @param {String} uid a discord user id
     */
    settleLocation: async (uid, name) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const entry = await client.database.collection('map').findOne({ xPos: userEntry.xPos, yPos: userEntry.yPos })
      if (entry == null) return Promise.reject('Map tile does not exist in database.')

      // check if city exist on tile
      if (entry.city != null) return Promise.reject('City exist on tile already.')

      // check if user has settler available
      if (!userEntry.hasSettler) return Promise.reject('User does not have available settler.')

      // check to make sure user doesnt already have a place named that
      let a = false
      userEntry.cities.forEach(city => {
        if (city.name.toLowerCase() == name.toLowerCase()) a = true
      })
      if (a) return Promise.reject('User has a city named this already.')

      const cityObject = {
        level: 1,
        xPos: userEntry.xPos,
        yPos: userEntry.yPos,
        inStasis: false,
        owner: uid,
        name: name,
        tradeRoutes: [],
        resources: {
          stone: 0,
          maxStone: 2000,
          metal: 0,
          maxMetal: 2000,
          wood: 0,
          maxWood: 2000,
          food: 200,
          maxFood: 3000
        },
        population: {
          military: 0,
          miners: 0,
          workers: 0,
          farmers: 0,
          unemployed: 100
        }
      }

      // create city in map
      await client.database.collection('map').updateOne({ xPos: userEntry.xPos, yPos: userEntry.yPos }, { $set: { city: cityObject } })

      // remove settler from user and add city to their city array
      userEntry.cities.push(cityObject)
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { hasSettler: false, cities: userEntry.cities } })

      // resolve on completion
      return Promise.resolve()
    },

    /**
      * Sets the flag of a user
      * @param {String} uid a discord user id
      * @param {String} url valid image url
     */
    setFlag: async (uid, url) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // set flag and return
      return client.database.collection('users').updateOne({ uid: uid }, { $set: { flagURL: url } })
    },

    /**
      * sets empire name
      * @param {String} uid a discord user id
      * @param {String} empireName name of empire
     */
    setEmpireName: async (uid, empireName) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // set empire name and return
      return client.database.collection('users').updateOne({ uid: uid }, { $set: { empireName: empireName } })
    },

    /**
      * Changes tiles cities name
      * @param {String} executor a discord user id of who executed
      * @param {Integer} xPos position on map grid
      * @param {Integer} yPos position on map grid
      * @param {String} name name of city
     */
    setCityName: async (executor, xPos, yPos, name) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: executor })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const mapEntry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (mapEntry == null) return Promise.reject('Map tile does not exist in database.')

      // check if city exist
      if (mapEntry.city == null) return Promise.reject('City does not exist on tile.')

      // check if user owns city
      if (mapEntry.city.owner != executor) return Promise.reject('User does not own city.')

      // locate user city entry and rename
      userEntry.cities.forEach(city => {
        if (city.xPos == xPos && city.yPos == yPos) {
          city.name = name
        }
      })

      // rename city on map and write both to database
      await client.database.collection('map').updateOne({ xPos: xPos, yPos: yPos }, { $set: { 'city.name': name } })
      await client.database.collection('users').updateOne({ uid: executor }, { $set: { cities: userEntry.cities } })

      // resolve
      Promise.resolve()
    },

    /**
      * Calculates next city level cost
      * @param {Integer} currentLevel the current level of what you want to check
     */
    calculateLevelCost: async (currentLevel) => {
      // formula is (3760.60309(1.63068)^x) with x being level
      const power = Math.pow(1.63068, currentLevel + 1)
      const cost = Math.floor(3760.60309 * power)

      // return cost
      return cost
    },

    /**
      * Calculates next city max population @ level
      * @param {Integer} level the level to run calculation with
     */
    calculateMaxPopulation: async (level) => {
      // calculate max population
      const maxPop = level * 1000

      // return cost
      return maxPop
    },

    /**
     * levels up a users city if they can afford it
     * @param {String} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     */
    levelCity: async (uid, xPos, yPos) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const mapEntry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (mapEntry == null) return Promise.reject('Map tile does not exist in database.')

      // check if city exist
      if (mapEntry.city == null) return Promise.reject('City does not exist on tile.')

      // check if user own city
      if (mapEntry.city.owner != uid) return Promise.reject('User does not own city.')

      // get cost
      const cost = await client.game.calculateLevelCost(mapEntry.city.level)

      // check if user can afford
      if (userEntry.gold - cost < 0) return Promise.reject('User cannot afford to level!')

      // find city in users array and update level
      userEntry.cities.forEach(city => {
        if (city.xPos == xPos && city.yPos == yPos) {
          city.level++
          city.resources.maxStone = city.level * 1.5 * 1000
          city.resources.maxMetal += city.level * 1.5 * 1000
          city.resources.maxWood += city.level * 1.5 * 1000
          city.resources.maxFood += city.level * 1.5 * 1000
        }
      })

      // write changes
      await client.database.collection('users').updateOne({ uid: uid }, {
        $set: {
          cities: userEntry.cities,
          gold: userEntry.gold - cost
        }
      })

      await client.database.collection('map').updateOne({ xPos: xPos, yPos: yPos }, {
        $set: {
          'city.level': mapEntry.city.level++,
          'city.resources.maxStone': mapEntry.city.level * 1.5 * 1000,
          'city.resources.maxMetal': mapEntry.city.level * 1.5 * 1000,
          'city.resources.maxWood': mapEntry.city.level * 1.5 * 1000,
          'city.resources.maxFood': mapEntry.city.level * 1.5 * 1000
        }
      })

      // resolve once finished
      return Promise.resolve()
    },

    /**
     * moves work force between jobs at a settlement
     * @param {String} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     * @param {String} origin original work force you want to modify
     * @param {String} target target work force you want to move original to
     * @param {Integer} amount amount to transition
     */
    changePopulationJob: async (uid, xPos, yPos, origin, target, amount) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const mapEntry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (mapEntry == null) return Promise.reject('Map tile does not exist in database.')

      // check if city exist
      if (mapEntry.city == null) return Promise.reject('City does not exist on tile.')

      // check if user owns city
      if (mapEntry.city.owner != uid) return Promise.reject('User does not own city.')

      // uniformize job names
      origin = origin.toLowerCase()
      target = target.toLowerCase()

      // check to make sure job exist
      const possibleJobs = ['military', 'workers', 'farmers', 'miners', 'unemployed']

      if (!possibleJobs.includes(origin)) return Promise.reject('Origin job does not exist.')
      if (!possibleJobs.includes(target)) return Promise.reject('Target job does not exist.')

      // check to make sure there are no shenanigans going on here
      if (amount <= 0) return Promise.reject('You must enter a value greater than 0.')
      if (mapEntry.city.population[origin] - amount < 0) return Promise.reject('You do not have enough people to do this.')

      // do calculations for both map entry and user entry
      userEntry.cities.forEach(city => {
        if (city.xPos == xPos && city.yPos == yPos) {
          city.population[origin] -= amount
          city.population[target] += amount
        }
      })

      mapEntry.city.population[origin] -= amount
      mapEntry.city.population[target] += amount

      // write to db
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { cities: userEntry.cities } })
      await client.database.collection('map').updateOne({ xPos: xPos, yPos: yPos }, { $set: { 'city.population': mapEntry.city.population } })

      return Promise.resolve()
    },

    /**
     * Scouts the tile the user is currently on
     * @param {Integer} xPos a position on map
     * @param {Integer} yPos a position on map
     */
    calculateScoutTime: async (xPos, yPos) => {
      // check if tile exist
      const mapEntry = await client.database.collection('map').findOne({ xPos: xPos, yPos: yPos })
      if (mapEntry == null) return Promise.reject('Map tile does not exist in database.')

      //do calculation
      let time = 60000

      return Promise.resolve(time)
    },


    /**
     * Scouts the tile the user is currently on
     * @param {String} uid a discord user id
     */
    scoutTile: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // check if tile exist
      const mapEntry = await client.database.collection('map').findOne({ xPos: userEntry.xPos, yPos: userEntry.yPos })
      if (mapEntry == null) return Promise.reject('Map tile does not exist in database.')

      // check if user is on cooldown
      if (client.game.scoutCooldown.has(uid)) return Promise.reject('User is currently scouting a tile.')

      // push tile to array and write to database
      await userEntry.scoutedTiles.push({ xPos: userEntry.xPos, yPos: userEntry.ypos })

      // scan time calculation
      const time = await client.game.calculateScoutTime(userEntry.xPos, userEntry.yPos)

      // add user to cooldown array and setup task
      client.game.scoutCooldown.set(uid, {
        startTime: moment().unix(),
        endTime: moment().unix() + time
      })

      setTimeout(() => {
        // remove user from cooldown array
        client.game.scoutCooldown.delete(uid)

        // move user in database
        client.database.collection('users').updateOne({ uid: uid }, { $set: { scoutedTiles: userEntry.scoutedTiles } })
      }, time)

      // resolve cooldown time and map entry
      return Promise.resolve({
        time: time,
        mapEntry: mapEntry
      })
    },

    /**
     * Generates the gold in the users cities
     * @param {String} uid Users discord id
     */
    generateGold: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      let goldGenerated = 0

      // for each city
      userEntry.cities.forEach(async cityEntry => {
        // calculate gold creation
        goldGenerated += Math.ceil(cityEntry.population.miners)
      })

      // add gold to user wallet
      userEntry.gold += goldGenerated

      // write user to user database
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { gold: userEntry.gold } })

      // resolve once complete
      return Promise.resolve()
    },

    /**
     * Generates the food in the users cities
     * @param {String} uid Users discord id
     */
    generateFood: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // for each city
      userEntry.cities.forEach(async cityEntry => {
        // calculate generated food
        const generatedFood = Math.ceil(cityEntry.population.farmers * 1.5)

        // if they make more food then they can store, cap it
        if (cityEntry.resources.maxFood < cityEntry.resources.food + generatedFood) cityEntry.resources.food = cityEntry.resources.maxFood
        else cityEntry.resources.food += generatedFood

        // write city to map database
        await client.database.collection('map').updateOne({ xPos: cityEntry.xPos, yPos: cityEntry.yPos }, { $set: { city: cityEntry } })
      })

      // write user to user database
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { cities: userEntry.cities } })

      // resolve once complete
      return Promise.resolve()
    },

    /**
     * Generates the resource in the users cities
     * @param {String} uid Users discord id
     */
    generateResource: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // for each city
      userEntry.cities.forEach(async cityEntry => {
        // calculate growth of resource
        if (cityEntry.resources.stone + cityEntry.population.workers > cityEntry.resources.maxStone) cityEntry.resources.stone = cityEntry.resources.maxStone
        else cityEntry.resources.stone += cityEntry.population.workers

        if (cityEntry.resources.metal + cityEntry.population.workers > cityEntry.resources.maxMetal) cityEntry.resources.metal = cityEntry.resources.maxMetal
        else cityEntry.resources.metal += cityEntry.population.workers

        if (cityEntry.resources.wood + cityEntry.population.workers > cityEntry.resources.maxWood) cityEntry.resources.wood = cityEntry.resources.maxWood
        else cityEntry.resources.wood += cityEntry.population.workers

        // write city to map database
        await client.database.collection('map').updateOne({ xPos: cityEntry.xPos, yPos: cityEntry.yPos }, { $set: { city: cityEntry } })
      })

      // write user to user database
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { cities: userEntry.cities } })

      // resolve once complete
      return Promise.resolve()
    },

    /**
     * Consume food function
     * @param {String} uid Users discord id
     */
    consumeFood: async (uid) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      // for each city
      userEntry.cities.forEach(async cityEntry => {
        // get total population
        const totalPopulation = Object.values(cityEntry.population).reduce((a, b) => a + b, 0)

        // get total food
        const food = cityEntry.resources.food

        // if there is less food then there is population, remove some population, else add population
        if (food < totalPopulation) {
          // set food to 0 since they ate it all
          cityEntry.resources.food = 0

          // calculate popualtion loss
          const populationLoss = Math.abs(food - totalPopulation)

          // calculate population loss (percent based on jobs)
          Object.keys(cityEntry.population).forEach(key => {
            cityEntry.population[key] -= Math.ceil(populationLoss * (cityEntry.population[key] / totalPopulation))
          })
        } else if (food > totalPopulation) {
          // calculate popualtion growth
          const populationGrowth = Math.ceil(Math.abs((totalPopulation - food) / 2))

          // remove eaten food
          cityEntry.resources.food -= totalPopulation

          // add unemployed citizens to the population
          cityEntry.population.unemployed += populationGrowth
        }

        // write city to map database
        await client.database.collection('map').updateOne({ xPos: cityEntry.xPos, yPos: cityEntry.yPos }, { $set: { city: cityEntry } })
      })

      // write user to user database
      await client.database.collection('users').updateOne({ uid: uid }, { $set: { cities: userEntry.cities } })

      // resolve once complete
      return Promise.resolve()
    },

    /**
     * Gets user cities based on page number
     * @param {String} uid
     * @param {Integer} pageNumber
     */
    getUserCityNames: async (uid, pageNumber) => {
      // check if user exist
      const userEntry = await client.database.collection('users').findOne({ uid: uid })
      if (userEntry == null) return Promise.reject('User does not exist in database.')

      //loop through and grab entries
      let outputArray = []
      for(let i = 5 * pageNumber - 5; i <= 5 * pageNumber; i++) {
        outputArray.push(userEntry.cities[i].name)
      }

      //resolve
      return Promise.resolve(outputArray)
    }
  }
}

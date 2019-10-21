/* eslint-disable prefer-promise-reject-errors */

/**
 * Check status code of the response
 * @param {node-fetch Response} res Response from node-fetch call
 */
function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res
  } else {
    throw new Error(res.statusText)
  }
}

module.exports = client => {
  /**
   * Dependencies
   */
  const fetch = require('node-fetch')

  /**
   * Call the remote API
   * @param {String} url URL to remote API
   * @param {Object} options node-fetch options
   * @returns {Response} Returns JSON response
   */
  function callAPI (url, method, body, user) {
    return new Promise((resolve, reject) => {
    /**
     * Make API request
     */
      fetch(client.settings.api.apiRoot + url, {
        method: method || 'GET',
        body: body ? JSON.stringify(body) : null,
        headers: {
          'Content-Type': 'application/json',
          user: user || undefined
        }
      })
        .then(checkStatus)
        .then(res => res.json())
        .then(json => {
          resolve(json)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  console.log('loaded api')

  /** @namespace */
  client.game = {

    callAPI: callAPI,

    /**
     * Contains the user id's of everyone currently traveling
     */
    movementCooldown: new Map(),
    scoutCooldown: new Map(),

    /**
     * Create a database object for the guild
     * @param {Snowflake} uid a discord user id
     * @returns {Promise<User>} User Information
     */
    createUser: (uid) => {
      return callAPI(`/users/${uid}`, 'PUT')
    },

    /**
     * Gets a tiles information
     * @param {Integer} xPos Tile's X Position
     * @param {Integer} yPos Tile's Y Position
     * @returns {Promise<Tile>} Tile Information
     */
    getTile: (xPos, yPos) => {
      return callAPI(`/tiles/${xPos}/${yPos}`, 'GET')
    },

    /**
       * Gets all users tiles
       * @param {Snowflake} uid User's ID
       * @returns {Promise<Array<City>>} Array of cities this user owns
       */
    getUserCities: (uid) => {
      return callAPI(`/users/${uid}/cities`, 'GET')
    },

    /**
    * Moves user to location
    * @param {Snowflake} uid a discord user id
    * @returns {Object}
    * @returns {Object.xPos} User's current X position
    * @returns {Object.yPos} User's current Y position
    */
    stopUser: (uid) => {
      return callAPI(`/users/${uid}/move/stop`, 'POST')
    },

    /**
    * Moves user to location
    * @param {Snowflake} uid a discord user id
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    * @returns {Integer} Time of travel in ms
    */
    moveUser: async (uid, xPos, yPos) => {
      return (await (callAPI(`/users/${uid}/move/${xPos}/${yPos}`, 'POST'))).time
    },

    /**
    * Calculates travel time
    * @param {Integer} x1 position on map grid
    * @param {Integer} y1 position on map grid
    * @param {Integer} x2 position on map grid
    * @param {Integer} y2 position on map grid
    * @returns {Promise<Integer>} in ms
    */
    calculateTravelTime: async (x1, y1, x2, y2) => {
      return (await (callAPI(`/tiles/${x1}/${y1}/time/${x2}/${y2}`, 'GET'))).time
    },

    /**
    * Settles location of player if settler available
    * @param {Snowflake} uid User Discord ID
    * @param {String} name City name
    * @returns {City} City object
    */
    settleLocation: (uid, name) => {
      return callAPI(`/users/${uid}/cities`, 'POST', { name: name })
    },

    /**
     * Removes a users city - jpb sucks at documentation
     * @param {Snowflake} uid Discord id
     * @param {Integer} xPos position map
     * @param {Integer} yPos position map
     */
    destroyCity: (uid, xPos, yPos) => {
      return callAPI(`/cities/${xPos}/${yPos}`, 'DELETE', null, uid)
    },

    /**
    * Sets the flag of a user
    * @param {Snowflake} uid a discord user id
    * @param {String} url valid image url
    */
    setFlag: (uid, url) => {
      return callAPI(`/users/${uid}/flag`, 'POST', { flagURL: url })
    },

    /**
        * sets empire name
        * @param {Snowflake} uid a discord user id
        * @param {String} empireName name of empire
       */
    setEmpireName: (uid, empireName) => {
      return callAPI(`/users/${uid}/empire/name`, 'POST', { name: empireName })
    },

    /**
    * Changes tiles cities name
    * @param {Snowflake} executor a discord user id of who executed
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    * @param {String} name name of city
    */
    setCityName: (executor, xPos, yPos, name) => {
      return callAPI(`/cities/${xPos}/${yPos}/name`, 'POST', { name: name }, executor)
    },

    /**
        * Calculates next city level cost
        * @param {Integer} currentLevel the current level of what you want to check
       */
    calculateLevelCost: async (currentLevel) => {
      return (await (callAPI(`/cities/level/${currentLevel}`, 'GET'))).cost
    },

    /**
    * Calculates next city max population @ level
    * @param {Integer} level the level to run calculation with
    */
    calculateMaxPopulation: async (level) => {
      return (await (callAPI(`/cities/maxpop/${level}`, 'GET'))).cost
    },

    /**
     * levels up a users city if they can afford it
     * @param {Snowflake} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     */
    levelCity: (uid, xPos, yPos) => {
      return callAPI(`/cities/${xPos}/${yPos}/level`, 'POST', null, uid)
    },

    /**
     * moves work force between jobs at a settlement
     * @param {Snowflake} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     * @param {String} origin original work force you want to modify
     * @param {String} target target work force you want to move original to
     * @param {Integer} amount amount to transition
     */
    changePopulationJob: (uid, xPos, yPos, origin, target, amount) => {
      return callAPI(`/cities/${xPos}/${yPos}/population`, 'POST', { from: origin, to: target, amount: amount }, uid)
    },

    /**
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid discord id
     */
    calculateScoutTime: (uid) => {
      return callAPI(`/users/${uid}/scout`, 'GET')
    },

    /**
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid a discord user id
     */
    scoutTile: (uid) => {
      return callAPI(`/users/${uid}/scout`, 'POST')
    },

    /**
     * Gets user cities based on page number
     * @param {Snowflake} uid
     * @param {Integer} pageNumber
     */
    getUserCityNames: (uid, pageNumber) => {
      return callAPI(`/users/${uid}/cities/names?page=${pageNumber || 1}`, 'GET')
    },

    getLeaderboard: (by, pageNumber) => {
    },

    /**
     * Gets the city by the name
     * @param {Snowflake} uid
     * @param {String} name
     */
    getCityByName: async (uid, name) => {
      const cities = await client.game.getUserCities(uid)
      const city = cities.find(x => x.name.toLowerCase() === name.toLowerCase())
      return city || null
    },

    /**
     * Creates a user alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    createAlliance: (uid, name) => {
      return callAPI('/alliances', 'PUT', { name: name }, uid)
    },

    /**
     * Applies to alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    applyToAlliance: (uid, name) => {
      return callAPI('/alliances/apply', 'PUT', { name: name }, uid)
    },

    /**
     * Cancels alliance application
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    cancelAllianceApplication: (uid, name) => {
      return callAPI('/alliances/apply', 'DELETE', { name: name }, uid)
    },

    /**
     * Accepts user into alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    acceptToAlliance: (uid, target) => {
      return callAPI(`/alliances/apply/accept/${target}`, 'POST', uid)
    },

    /**
     * Denies user from alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    denyFromAlliance: (uid, target) => {
      return callAPI(`/alliances/apply/deny/${target}`, 'POST', uid)
    },

    /**
     * Gets the users alliance object
     * @param {Snowflake} uid
     */
    getAlliance: (uid) => {
      return callAPI(`/users/${uid}/alliance`, 'GET')
    },

    /**
     * Makes user leave alliance
     * @param {Snowflake} uid
     */
    leaveAlliance: (uid) => {
      return callAPI(`/users/${uid}/alliance`, 'DELETE')
    }
  }
}

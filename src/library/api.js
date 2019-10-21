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
  const settings = client.settings.api

  /** @namespace */
  client.api = {

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
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}`, { method: 'PUT' })
          .then(checkStatus)
          .then(res => res.json())
          .then(json => {
            resolve(json)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    /**
     * Gets a tiles information
     * @param {Integer} xPos Tile's X Position
     * @param {Integer} yPos Tile's Y Position
     * @returns {Promise<Tile>} Tile Information
     */
    getTile: (xPos, yPos) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/tiles/${xPos}/${yPos}`, { method: 'GET' })
          .then(checkStatus)
          .then(res => res.json())
          .then(json => {
            resolve(json)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    /**
       * Gets all users tiles
       * @param {Snowflake} uid User's ID
       * @returns {Promise<Array<City>>} Array of cities this user owns
       */
    getUserCities: async (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/cities`, { method: 'GET' })
          .then(checkStatus)
          .then(res => res.json())
          .then(json => {
            resolve(json)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    /**
    * Moves user to location
    * @param {Snowflake} uid a discord user id
    */
    stopUser: async (uid) => {
    },

    /**
    * Moves user to location
    * @param {Snowflake} uid a discord user id
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    */
    moveUser: async (uid, xPos, yPos) => {
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
    },

    /**
    * Settles location of player if settler available
    * @param {Snowflake} uid User Discord ID
    * @param {String} name City name
    * @returns {City} City object
    */
    settleLocation: async (uid, name) => {
    },

    /**
     * Removes a users city - jpb sucks at documentation
     * @param {Snowflake} uid Discord id
     * @param {Integer} xPos position map
     * @param {Integer} yPos position map
     */
    destroyCity: async (uid, xPos, yPos) => {
    },

    /**
    * Sets the flag of a user
    * @param {Snowflake} uid a discord user id
    * @param {String} url valid image url
    */
    setFlag: async (uid, url) => {
    },

    /**
        * sets empire name
        * @param {Snowflake} uid a discord user id
        * @param {String} empireName name of empire
       */
    setEmpireName: async (uid, empireName) => {
    },

    /**
    * Changes tiles cities name
    * @param {Snowflake} executor a discord user id of who executed
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    * @param {String} name name of city
    */
    setCityName: async (executor, xPos, yPos, name) => {
    },

    /**
        * Calculates next city level cost
        * @param {Integer} currentLevel the current level of what you want to check
       */
    calculateLevelCost: async (currentLevel) => {
    },

    /**
    * Calculates next city max population @ level
    * @param {Integer} level the level to run calculation with
    */
    calculateMaxPopulation: async (level) => {
    },

    /**
     * levels up a users city if they can afford it
     * @param {Snowflake} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     */
    levelCity: async (uid, xPos, yPos) => {
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
    changePopulationJob: async (uid, xPos, yPos, origin, target, amount) => {
    },

    /**
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid discord id
     */
    calculateScoutTime: async (uid) => {
    },

    /**
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid a discord user id
     */
    scoutTile: async (uid) => {
    },

    /**
     * Generates the gold in the users cities
     * @param {Snowflake} uid Users discord id
     */
    generateGold: async (uid) => {
    },

    /**
     * Generates the food in the users cities
     * @param {Snowflake} uid Users discord id
     */
    generateFood: async (uid) => {
    },

    /**
     * Generates the resource in the users cities
     * @param {Snowflake} uid Users discord id
     */
    generateResource: async (uid) => {
    },

    /**
     * Consume food function
     * @param {Snowflake} uid Users discord id
     */
    consumeFood: async (uid) => {
    },

    /**
     * Gets user cities based on page number
     * @param {Snowflake} uid
     * @param {Integer} pageNumber
     */
    getUserCityNames: async (uid, pageNumber) => {
    },

    getLeaderboard: async (by, pageNumber) => {
    },

    /**
     * Gets the city by the name
     * @param {Snowflake} uid
     * @param {String} name
     */
    getCityByName: async (uid, name) => {
    },

    /**
     * Creates a user alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    createAlliance: async (uid, name) => {
    },

    /**
     * Applies to alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    applyToAlliance: async (uid, name) => {
    },

    /**
     * Cancels alliance application
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    cancelAllianceApplication: async (uid) => {
    },

    /**
     * Accepts user into alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    acceptToAlliance: async (uid, target) => {
    },

    /**
     * Denies user from alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    denyFromAlliance: async (uid, target) => {
    },

    /**
     * Gets the users alliance object
     * @param {Snowflake} uid
     */
    getAlliance: async (uid) => {
    },

    /**
     * Makes user leave alliance
     * @param {Snowflake} uid
     */
    leaveAlliance: async (uid) => {
    }
  }
}

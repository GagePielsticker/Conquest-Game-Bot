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
    getUserCities: (uid) => {
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
    * @returns {Object}
    * @returns {Object.xPos} User's current X position
    * @returns {Object.yPos} User's current Y position
    */
    stopUser: (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/move/stop`, { method: 'POST' })
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
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    * @returns {Integer} Time of travel in ms
    */
    moveUser: (uid, xPos, yPos) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/move/${xPos}/${yPos}`, { method: 'POST' })
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
    * Calculates travel time
    * @param {Integer} x1 position on map grid
    * @param {Integer} y1 position on map grid
    * @param {Integer} x2 position on map grid
    * @param {Integer} y2 position on map grid
    * @returns {Promise<Integer>} in ms
    */
    calculateTravelTime: (x1, y1, x2, y2) => {
      return new Promise((resolve) => {
        // distance formula from user to target
        const a = x1 - x2
        const b = y1 - y2
        const distance = Math.sqrt(a * a + b * b)

        // calculate time from distance
        const time = distance * 10

        // return time in milleseconds
        resolve(Math.floor(time * 1000))
      })
    },

    /**
    * Settles location of player if settler available
    * @param {Snowflake} uid User Discord ID
    * @param {String} name City name
    * @returns {City} City object
    */
    settleLocation: (uid, name) => {
    },

    /**
     * Removes a users city - jpb sucks at documentation
     * @param {Snowflake} uid Discord id
     * @param {Integer} xPos position map
     * @param {Integer} yPos position map
     */
    destroyCity: (uid, xPos, yPos) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/cities/${xPos}/${yPos}`, { method: 'POST', headers: { user: uid } })
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
    * Sets the flag of a user
    * @param {Snowflake} uid a discord user id
    * @param {String} url valid image url
    */
    setFlag: (uid, url) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/flag`, { method: 'POST', body: { flagURL: url } })
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
        * sets empire name
        * @param {Snowflake} uid a discord user id
        * @param {String} empireName name of empire
       */
    setEmpireName: (uid, empireName) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/empire/name`, { method: 'POST', body: { name: empireName } })
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
    * Changes tiles cities name
    * @param {Snowflake} executor a discord user id of who executed
    * @param {Integer} xPos position on map grid
    * @param {Integer} yPos position on map grid
    * @param {String} name name of city
    */
    setCityName: (executor, xPos, yPos, name) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/cities/${xPos}/${yPos}/name`, { method: 'POST', body: { name: name }, headers: { user: executor } })
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
        * Calculates next city level cost
        * @param {Integer} currentLevel the current level of what you want to check
       */
    calculateLevelCost: (currentLevel) => {
      return new Promise((resolve, reject) => {
        // formula is (3760.60309(1.63068)^x) with x being level
        const power = Math.pow(1.63068, currentLevel + 1)
        const cost = Math.floor(3760.60309 * power)

        // resolve cost
        resolve(cost)
      })
    },

    /**
    * Calculates next city max population @ level
    * @param {Integer} level the level to run calculation with
    */
    calculateMaxPopulation: (level) => {
      return new Promise((resolve, reject) => {
        // calculate max population
        const maxPop = level * 1000

        // return cost
        resolve(maxPop)
      })
    },

    /**
     * levels up a users city if they can afford it
     * @param {Snowflake} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     */
    levelCity: (uid, xPos, yPos) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/cities/${xPos}/${yPos}/level`, { method: 'POST', headers: { user: uid } })
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
     * moves work force between jobs at a settlement
     * @param {Snowflake} uid a discord user id
     * @param {Integer} xPos position on map grid
     * @param {Integer} yPos position on map grid
     * @param {String} origin original work force you want to modify
     * @param {String} target target work force you want to move original to
     * @param {Integer} amount amount to transition
     */
    changePopulationJob: (uid, xPos, yPos, origin, target, amount) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/cities/${xPos}/${yPos}/population`, { method: 'POST', body: { from: origin, to: target, amount: amount }, headers: { user: uid } })
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
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid discord id
     */
    calculateScoutTime: (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/scout`, { method: 'GET' })
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
     * Scouts the tile the user is currently on
     * @param {Snowflake} uid a discord user id
     */
    scoutTile: (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/scout`, { method: 'POST' })
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
     * Gets user cities based on page number
     * @param {Snowflake} uid
     * @param {Integer} pageNumber
     */
    getUserCityNames: (uid, pageNumber) => {
    },

    getLeaderboard: (by, pageNumber) => {
    },

    /**
     * Gets the city by the name
     * @param {Snowflake} uid
     * @param {String} name
     */
    getCityByName: (uid, name) => {
    },

    /**
     * Creates a user alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    createAlliance: (uid, name) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/alliances`, { method: 'PUT', body: { name: name }, headers: { user: uid } })
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
     * Applies to alliance
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    applyToAlliance: (uid, name) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/apply`, { method: 'PUT', body: { name: name }, headers: { user: uid } })
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
     * Cancels alliance application
     * @param {Snowflake} uid discord id
     * @param {String} name alliance name
     */
    cancelAllianceApplication: (uid, name) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/apply`, { method: 'DELETE', body: { name: name }, headers: { user: uid } })
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
     * Accepts user into alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    acceptToAlliance: (uid, target) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/apply/accept/${target}`, { method: 'POST', headers: { user: uid } })
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
     * Denies user from alliance
     * @param {Snowflake} uid
     * @param {Snowflake} target
     */
    denyFromAlliance: (uid, target) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/apply/deny/${target}`, { method: 'POST', headers: { user: uid } })
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
     * Gets the users alliance object
     * @param {Snowflake} uid
     */
    getAlliance: (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/alliance`, { method: 'GET' })
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
     * Makes user leave alliance
     * @param {Snowflake} uid
     */
    leaveAlliance: (uid) => {
      return new Promise((resolve, reject) => {
        /**
         * Make API request
         */
        fetch(`${settings.apiRoot}/users/${uid}/alliance`, { method: 'DELETE' })
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
  }
}

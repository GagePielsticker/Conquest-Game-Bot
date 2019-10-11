const express = require('express')
const router = express.Router()

/**
 * Handles Index routing
 */
router.get('/', (req, res, next) => {
  res.render('index')
})

/**
 * Handles Index routing
 */
router.get('/map', (req, res, next) => {
  res.render('map')
})

module.exports = router

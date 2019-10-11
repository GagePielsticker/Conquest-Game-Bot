const express = require('express')
const router = express.Router()
const passport = require('passport')

/**
 * Handles initiating authentication
 */
router.get('/discord', passport.authenticate('discord'))

/**
 * Catches discords callback
 */
router.get('/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/') // if auth success
})

/**
 * Handles Logouts
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

module.exports = router

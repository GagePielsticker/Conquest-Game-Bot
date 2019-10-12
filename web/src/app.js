// Dependencies
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const ejs = require('ejs')
const session = require('express-session')
const passport = require('passport')
const DiscordStrategy = require('passport-discord').Strategy
const authSettings = require('./settings/settings.json')

// passport setup
passport.use(new DiscordStrategy({
  clientID: authSettings.auth.clientID,
  clientSecret: authSettings.auth.clientSecret,
  callbackURL: authSettings.auth.callbackURL,
  scope: authSettings.auth.scope
}, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile)
}))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

// view engine setup
const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// session setup
app.use(session({
  secret: authSettings.auth.sessionSecret,
  saveUninitialized: true,
  resave: true
}))

// middleware setup
app.use(logger('common'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())

// get and use routers
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')

app.use('/', indexRouter)
app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)))

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message

  // render the error page
  res.status(err.status)
  res.render('error', { status: err.status })
})

module.exports = app

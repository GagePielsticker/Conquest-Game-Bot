const express = require('express')
const router = express.Router()

/**
 * Api Homepage Rendering
 */
router.get('/', (req, res) => {
  res.render('api')
})

/**
 * Handles Image Uploading (sharex)
 */
const fs = require('fs')
const pname = require('project-name-generator')
const multer = require('multer')
const mtr = multer()

router.post('/upload', mtr.any(), async (req, res) => {
  const tCheck = req.files[0].originalname.split('.')[1]
  if (tCheck != 'png' && tCheck != 'gif' && tCheck != 'jpg' && tCheck != 'jpeg' && tCheck != 'webp') { return res.status(500).json({ error: 'Not a valid image format (png/gif/jpg/jpeg/webp)' }) }
  const type = tCheck || 'png'
  const path = `${pname.generate({ words: 2, number: true }).dashed}.${type}`
  fs.writeFile(`./src/public/i/${path}`, req.files[0].buffer, (err) => {
    if (err) return res.status(500).json({ error: 'Server error.' })
    return res.status(200).send(`https://${req.get('host')}/i/${path}`)
  })
})

module.exports = router

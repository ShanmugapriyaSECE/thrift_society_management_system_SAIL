const express = require('express')
const router = express.Router()
const { getTallyRegister } = require('../controllers/tallyController')

router.get('/', getTallyRegister)

module.exports = router

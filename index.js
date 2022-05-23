const express = require('express')
const app = express()
require('dotenv').config()
var cors = require('cors')
const port = process.PORT || 5000
require('dotenv').config()
// muddle 
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server open!')
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
const express = require('express')
const app = express()
require('dotenv').config()
var cors = require('cors')
const port = process.PORT || 5000
require('dotenv').config()
// muddle 
app.use(cors())
app.use(express.json());

// mongodb connection 

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.Us_name}:${process.env.DBPASS}@cluster0.chhfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const pertsCollection = client.db("Computers").collection("perts");
        app.post('/perts', async (req, res) => {
            const perts = req.body;
            const result = await pertsCollection.insertOne(perts);
            res.send(result);
        })
    }
    finally {
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Server open!')
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
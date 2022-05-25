const express = require('express')
const app = express()
require('dotenv').config()
var jwt = require('jsonwebtoken');
var cors = require('cors')
const port = process.PORT || 5000
require('dotenv').config()
// muddle 
app.use(cors())
app.use(express.json());

// mongodb connection 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        app.get('/perts', async (req, res) => {
            const result = await pertsCollection.find().toArray();
            res.send(result);
        })
        app.get('/perts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await pertsCollection.findOne(query);
            res.send(result);
        })
        app.delete('/perts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await pertsCollection.deleteOne(filter);
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
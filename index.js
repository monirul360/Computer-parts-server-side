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

const stripe = require("stripe")('sk_test_51L2KrPBqppFXqmqSMlSHkIQUBu9sVzUvYZVsN45p8WachNPw0Rcer0aPQNcnGaOnuGPQ0RipdL2b2bexyqHMmpTY008WdeIEOV');
// mongodb connection 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.Us_name}:${process.env.DBPASS}@cluster0.chhfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function veriFyJwtToken(req, res, next) {
    const AuthHeader = req.headers.authraze;
    if (!AuthHeader) {
        return res.status(401).send({ message: 'Unauthrorizede access' });
    }
    const token = AuthHeader;
    jwt.verify(token, process.env.SICRITE_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const pertsCollection = client.db("Computers").collection("perts");
        const reviewCollection = client.db("Computers").collection("review");
        const bookingCollection = client.db("Computers").collection("booking");
        const userCollection = client.db("Computers").collection("user");
        const paymentCollection = client.db('Computers').collection('payments');
        //   
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
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })
        app.get('/booking', veriFyJwtToken, async (req, res) => {
            const email = req.query.email;
            const deCodeEmail = req.decoded.email;
            if (email === deCodeEmail) {
                const query = { email: email };
                const bookings = await bookingCollection.find(query).toArray();
                return res.send(bookings);
            } else {
                return res.status(403).send({ message: 'Forbidden access' })
            }
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const users = await userCollection.findOne({ email: email });
            res.send(users);
        })
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        })

        // 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            var token = jwt.sign({ email: email }, process.env.SICRITE_KEY, { expiresIn: '24d' });
            res.send({ result, token });
        })
        app.get('/user', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', veriFyJwtToken, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAcount = await userCollection.findOne({ email: requester })
            if (requesterAcount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            } else {
                res.status(403).send({ message: 'forbidden' });
            }
        })

        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const price = service.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });

        app.put('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const result = await paymentCollection.insertOne(payment);
            const updatedBooking = await bookingCollection.updateOne(filter, updatedDoc);
            res.send(updatedBooking);
        })
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.findOne(query);
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
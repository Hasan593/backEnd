const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hldream.lq9fn.mongodb.net/?retryWrites=true&w=majority&appName=hldream`;    // Uniform Resource Identifier
// mongobd client
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Database
        const db = client.db('sunnah-storeDB');
        // Collcetions
        const productsCollections = db.collection('products');
        
        // Get all product from db
        app.get('/products', async (req, res) => {
            try {
                const products = await productsCollections.find().toArray();
                res.send(products)
            } catch (error) {
                error.message
            }
        })

        // Get a single product from db
        app.get('/products/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await productsCollections.findOne({
                    _id: new ObjectId(id),
                });
                res.send({
                    data: result
                });
            } catch (error) {
                error.message
            }
        });

        // Post product to db
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            res.send({
                status: "success",
                data: result
            })
        })
        console.log('Connected to db')
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Wellcome to our server")
})

app.listen(port, () => console.log(`Server is running on port ${port}`));
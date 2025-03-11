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
                console.error("Error fetching product:", error.message)
                res.status(500).send({message: "Internal Server Error"})
            }
        })

        // Get a single product from the database
        app.get('/products/:id', async (req, res) => {
            try {
                // Extract product ID from request parameters
                const id = req.params.id;

                // Find the product in the collection by its ID
                const result = await productsCollections.findOne(
                    { _id: new ObjectId(id) }, // Convert string ID to ObjectId
                    {
                        projection: { _id: 0, name: 0 } // Exclude _id and name fields from response
                    }
                );

                // Send the found product data as a response
                res.send(result);

            } catch (error) {
                console.error("Error fetching product:", error.message); // Log the error
                res.status(500).send({ message: "Internal Server Error" }); // Send an error response
            }
        });

        //Query product from the database
        app.get('/queryProduct', async ( req, res ) => {
            const result = await productsCollections.find({
                price: {$gt: 400}
            }).toArray();
            res.send(result);
        })

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
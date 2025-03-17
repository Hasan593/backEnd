const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
// console.log("DB_USER:", process.env.DB_USER); // যদি undefined দেখায়, তাহলে .env ফাইলে সঠিকভাবে ভ্যারিয়েবল সেট করো।
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hldream.lq9fn.mongodb.net/?retryWrites=true&w=majority&appName=hldream`;    // Uniform Resource Identifier
// mongobd client
const client = new MongoClient(uri/*, { অপ্রয়জনীয় কোড
    serverApi: {
        version: ServerApiVersion.v1, 
        strict: true,
        deprecationErrors: true
    }
}*/);

async function run() {
    try {
        // // Connect the client to the server	(optional starting in v4.7)
        // await client.connect(); অপ্রয়জনীয় কোড
        // Database
        const db = client.db('sunnah-storeDB');
        // Collcetions
        const productsCollections = db.collection('products');
        const usersCollections = db.collection('users');

        /************ START PRODUCT COLLECTION ***********/
        // Post a Single product to db
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            res.send({
                status: "success",
                data: result
            })
        })

        // Post many products to db
        app.post('/products', async (req, res) => {
            try {
                const product = req.body;
                const result = await productsCollections.insertMany(product);
                res.send({
                    success: true,
                    insertedCount: result.insertedCount,
                    insertedIds: result.insertedIds
                });
            } catch (error) {
                console.error("Error inserting products:", error.message);
                res.status(500).send({ success: false, message: error.message });
            }
        });

        // Get all product from db
        app.get('api/products', async (req, res) => {
            try {
                const products = await productsCollections.find( /*{
                    // Query Product
                    price: { $gt: 400 }
                }*/ ).toArray();
                res.send(products)
            } catch (error) {
                console.error("Error fetching product:", error.message)
                res.status(500).send({ message: "Internal Server Error" })
            }
        })

        // Get a single product from db
        app.get('/products/:id', async (req, res) => {
            try {
                // রিকোয়েষ্ট প্যারামিটার থেকে পণ্যের আইডি বের করুন
                const id = req.params.id;

                // সংগ্রহে (collection) থাকা পণ্যটিকে এর আইডি দিয়ে খুঁজু
                const result = await productsCollections.findOne(
                    { _id: new ObjectId(id) }, // স্ট্রিং আইডিকে ObjectId-তে রূপান্তর করুন
                    {
                        projection: { _id: 0, name: 0 } // response থেকে _id এবং name বাদ দিন

                    }
                );
                res.send(result);

            } catch (error) {
                console.error("Error fetching product:", error.message); // Log the error
                res.status(500).send({ message: "Internal Server Error" }); // Send an error response
            }
        });

        // Delete a single product from the database
        app.delete('/products/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await productsCollections.deleteOne(
                    { _id: new ObjectId(id) }
                );
                res.send(result);
            } catch (error) {
                console.error('Error Delete Product: ', error.message);
                res.status(500).send({ message: "Internal Server Error" })
            }
        })

        // Update a single product
        app.put('/product/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateProduct = req.body;
                const option = { upsert: true } // এটার মানে হলো আমি যখন কোনো প্রডাক্ট তাই আইডি দিয়ে আপডেট করব তখন যদি সেই আইডি দিয়ে কোনো প্রডাক্ট না থাকে তাহলে অটো একটা পডাক্ট তৈরি হয়ে যাবে।

                const result = await productsCollections.replaceOne(
                    { _id: new ObjectId(id) },
                    updateProduct,
                    option
                );
                res.send({
                    success: true,
                    modifiedCount: result.modifiedCount
                })
            } catch (error) {
                console.error("PUT Error:", error.message);
                res.status(500).send({ success: false, message: error.message });
            }
        });

        // Update a single product
        app.patch('/product/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateProduct = req.body;
                const option = { upsert: true } // এটার মানে হলো আমি যখন কোনো প্রডাক্ট তাই আইডি দিয়ে আপডেট করব তখন যদি সেই আইডি দিয়ে কোনো প্রডাক্ট না থাকে তাহলে অটো একটা পডাক্ট তৈরি হয়ে যাবে।

                const result = await productsCollections.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateProduct },
                    option
                );
                res.send({
                    success: true,
                    modifiedCount: result.modifiedCount
                })
            } catch (error) {
                console.error("PUT Error:", error.message);
                res.status(500).send({ success: false, message: error.message });
            }
        });

        /************ END PRODUCT COLLECTION ***********/

        /************ START USERS COLLECTION ***********/
        // Post a single user to db
        app.post('/user', async (req, res) => {
            try {
                const user = req.body;
        
                // Check if user already exists
                const userExists = await usersCollections.findOne({ email: user.email });
        
                if (userExists) {
                    return res.status(400).send({ message: 'User Already Exists' });
                }
        
                // Insert user if not exists
                const result = await usersCollections.insertOne(user);
        
                res.send({
                    status: 'Success',
                    data: result
                });
            } catch (error) {
                console.error("Error inserting user:", error.message);
                res.status(500).send({ status: 'Unsuccess', message: error.message });
            }
        });
        

        // Get all users from db
        app.get('/users', async (req, res) => {
            try {
                const users = await usersCollections.find().toArray();
                res.send(users);
            } catch (error) {
                console.error("Error fetching users:", error.message)
                res.status(500).send({ message: "Internal Server Error" })
            }
        });

        // Get a single user from db
        app.get('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await usersCollections.findOne(
                    {
                        _id: new ObjectId(id)
                    },
                    {
                        projection: { _id: 0 }
                    }
                );
                res.send(result);
            } catch (error) {
                console.error("Error fetching user:", error.message);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
        /************ END USERS COLLECTION ***********/

        console.log('Connected to db')
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Wellcome to our server")
})

// লোকাল সার্ভার ও প্রডাকশন এ চালানোর জন্য এই কন্ডিশন
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}
module.exports = app;
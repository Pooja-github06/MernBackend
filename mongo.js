
import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://Pooja:wR97RdPcxvMlRHd7@cluster0.athhtu0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const createProduct = async (req, res, next) => {
    console.log('Incoming body:', req.body);

    const newProduct = {
        name: req.body.name,
        price: req.body.price
    };

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('products_test'); // ✅ explicitly name DB
        const result = await db.collection('products').insertOne(newProduct);
        console.log('Insert result:', result);
    } catch (error) {
        console.error('Error inserting product:', error); // ✅ log actual error
        return res.status(500).json({ message: 'Could not store data.' });
    }

    await client.close();
    res.json(newProduct);
};


// const getProducts = async (req, res, next) => {
//     const client = new MongoClient(url)
//     try {
//         await client.connect();
//         const db = client.db();
//         const products = await db.collection('products').find().toArray();
//         res.json(products)

//     } catch (err) {
//         return res.json({ message: "Could not retrieve products" })
//     }
//     await client.close();
// };

const getProducts = async (req, res, next) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('products_test'); // optional: make DB name explicit
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ message: "Could not retrieve products" });
    } finally {
        await client.close();
    }
};


export { createProduct, getProducts }
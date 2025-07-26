import mongoose from "mongoose";
import Product from "./model/product.js"; // ❓

mongoose.connect('mongodb+srv://Pooja:wR97RdPcxvMlRHd7@cluster0.athhtu0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log("connected to database");
    })
    .catch(() => {
        console.log("connection failed");
    });

const createProduct = async (req, res, next) => {
    const createdProduct = new Product({
        name: req.body.name,
        price: req.body.price
    });

    const result = await createdProduct.save();
    res.json(result);
};

const getProducts = async (req, res, next) => {
    const products = await Product.find().exec();
    res.json(products)
}
export { createProduct, getProducts };

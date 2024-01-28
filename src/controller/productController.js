import { response } from "express";
import Product from "../model/product-schema.js";

export const getProducts = async (req, res) => {
  try {
    const data = await Product.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(501).json(error);
  }
};

export const getProductsById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ id: id });

    return res.status(200).json(JSON.stringify(product));
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

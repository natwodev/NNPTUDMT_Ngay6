var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

router.get('/', async function (req, res, next) {
  try {
    let result = await inventoryModel.find().populate('product');
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await inventoryModel.findById(req.params.id).populate('product');
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "Inventory not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/add-stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inventory = await inventoryModel.findOneAndUpdate(
      { product: product },
      { $inc: { stock: quantity } },
      { new: true }
    ).populate('product');
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/remove-stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock to remove" });
    }
    inventory = await inventoryModel.findOneAndUpdate(
      { product: product },
      { $inc: { stock: -quantity } },
      { new: true }
    ).populate('product');
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/reservation', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock to reserve" });
    }
    inventory = await inventoryModel.findOneAndUpdate(
      { product: product },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true }
    ).populate('product');
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/sold', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.reserved < quantity) {
      return res.status(400).send({ message: "Not enough reserved to mark as sold" });
    }
    inventory = await inventoryModel.findOneAndUpdate(
      { product: product },
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true }
    ).populate('product');
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;

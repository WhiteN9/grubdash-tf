const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req,res) => {
    res.json({data:orders})
}

const create = (req,res) => {

}

const read = (req,res) => {

}

const update = (req,res) => {

}

const destroy = (req,res) => {

}
module.exports = {list,create,read,update,delete:[destroy]}
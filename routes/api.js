/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const StockHandler = require('../controllers/stockHandler.js');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  const stockPrices = new StockHandler();
  
  app.route('/api/stock-prices')
    .get(async function (req, res){
    try {    
      let stock = req.query.stock;
      let like = req.query.like || false;
      let ip = await req.headers['x-forwarded-for'].split(',')[0] || req.connection.remoteAddress; // get ip by getting first part of x-forwarded-for only
      //console.log("Error break.");
      let stockData = null;
      let likeData = null;
      let multiple = false;
      if (Array.isArray(stock)) {
        multiple = true;
        stockData = [];
        likeData = [];
      }
      
      //console.log(`Stock: ${stock}, Like: ${like}, IP: ${ip}`);
      if (!multiple) {             
        stock = stock.toUpperCase();
        let output = {'stockData': null};
        output.stockData = await stockPrices.getData(stock);
        output.stockData.likes = await stockPrices.getLikes(stock, like, ip).then(res => res.likes); //.then to get likes. Can't do it all at once without then()
        res.json(output);
      } else {
        let output = {'stockData': []};
        stock[0] = stock[0].toUpperCase();
        stock[1] = stock[1].toUpperCase();
        output.stockData.push(await stockPrices.getData(stock[0]));
        output.stockData.push(await stockPrices.getData(stock[1]));
        
        // Add Likes
        let likes0 = await stockPrices.getLikes(stock[0], like, ip).then(res => res.likes);
        let likes1 = await stockPrices.getLikes(stock[1], like, ip).then(res => res.likes);
        //console.log(`${stock[0]}: ${likes0} likes, ${stock[1]}: ${likes1} likes`);
        output.stockData[0].rel_likes = likes0 - likes1;
        output.stockData[1].rel_likes = likes1 - likes0;
        res.json(output);
      }
     }
    catch{
      console.log('Cannot get stock price data.');
      return new Error('Cannot get stock price data.');
    } 
    
    });
    
};

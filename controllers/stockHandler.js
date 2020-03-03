'use strict'

const MongoClient = require('mongodb').MongoClient;
const CONNECTION_STRING = process.env.DB;
const fetch = require('node-fetch');

function StockHandler () {
  // Get Stock Data
  this.getData = async function (stock) {
    try {
      let response = await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`);
      let json = await response.json();
      let result = {'stock': json.symbol, 'price': json.latestPrice};
      return result;
    }
    catch {
      return new Error('Cannot retrieve stock data.');
    }
  };
  
  // Get Likes From DB
  this.getLikes = async function (stock, like, ip) {
    try { 
    let client = await MongoClient.connect(CONNECTION_STRING, {useUnifiedTopology: true})
      .catch(err => {return Error('Cannot retrieve like data from database.')});   
      
        const db = await client.db('test');
        const col = await db.collection('stock_likes');  
        //console.log('Successfully connected to database.');
        
        if (!like) {
          let doc = await col.findOne({'stock': stock}); // Need to use findOne() to get result instead of find()
          let likes = (!doc) ? 0 : await doc.likes.length; // Likes - zero if nill. Done before stringifying
          //doc = JSON.stringify(doc); // Need to stringify findOne result to see it in a string. But need to keep it an object to get data
          //console.log(`Stock: ${stock}, Doc: ${doc}`);
          return {'stock': stock, 'likes': likes}; 
        } else {
          let doc = await col.findOneAndUpdate({'stock': stock}, {'$addToSet': {'likes': ip}}, {'upsert': true, 'returnNewDocument': true});
          //console.log("Updated Document: "+JSON.stringify(doc));          
          return (!doc.value) ? {'stock': stock, 'likes': 1} : {'stock': stock, 'likes': doc.value.likes.length}; // updated doc is long and obj is inside .value. 
          // Note: Need to figure out how to return new object after upserting.
        } 
      }
      catch{
        console.log('Cannot retrieve like data from database.');
        return new Error('Cannot retrieve like data from database.');
      }
    
  }
  
}; 

module.exports = StockHandler;
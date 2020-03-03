/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for','70.31.48.72')
        .query({stock: 'goog'})
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.typeOf(res.body, 'Object');
           assert.equal(res.body.stockData.stock, 'GOOG');
           assert.property(res.body.stockData, 'stock');
           assert.property(res.body.stockData, 'price');
           assert.property(res.body.stockData, 'likes');
           assert.typeOf(res.body.stockData.stock, 'String');
           assert.typeOf(res.body.stockData.likes, 'Number');
           assert.typeOf(res.body.stockData.price, 'Number'); 
           assert.match(res.body.stockData.likes, /\d+/);
           assert.match(res.body.stockData.price, /\d+\.\d+/);
           done();
        });
      });
      
      var likes;
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for','70.31.48.72')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.typeOf(res.body, 'Object');
           assert.equal(res.body.stockData.stock, 'GOOG');
           assert.property(res.body.stockData, 'stock');
           assert.property(res.body.stockData, 'price');
           assert.property(res.body.stockData, 'likes');
           assert.isAbove(res.body.stockData.likes, 0);
           likes = res.body.stockData.likes;
           done();
        });       
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for','70.31.48.72')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.typeOf(res.body, 'Object');
           assert.equal(res.body.stockData.stock, 'GOOG');
           assert.property(res.body.stockData, 'stock');
           assert.property(res.body.stockData, 'price');
           assert.property(res.body.stockData, 'likes');
           assert.equal(res.body.stockData.likes, likes);
           likes = res.body.stockData.likes;
           done();
        });          
      });
      
      let rel_likes;
      test('2 stocks', function(done) {
         chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for','70.31.48.72')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.typeOf(res.body, 'Object');
           assert.isArray(res.body.stockData);
           assert.oneOf(res.body.stockData[0].stock, ['GOOG','MSFT']);
           assert.property(res.body.stockData[0], 'stock');
           assert.property(res.body.stockData[0], 'price');
           assert.property(res.body.stockData[0], 'rel_likes');
           assert.oneOf(res.body.stockData[1].stock, ['GOOG','MSFT']);
           assert.property(res.body.stockData[1], 'stock');
           assert.property(res.body.stockData[1], 'price');
           assert.property(res.body.stockData[1], 'rel_likes');           
           assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
           rel_likes = Math.abs(res.body.stockData[0].rel_likes);           
           done();
        });            
      });
      
      test('2 stocks with like', function(done) {
         chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for','70.31.48.72')
        .query({stock: ['goog','msft'], like: true})
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.typeOf(res.body, 'Object');
           assert.oneOf(res.body.stockData[0].stock, ['GOOG','MSFT']);
           assert.property(res.body.stockData[0], 'stock');
           assert.property(res.body.stockData[0], 'price');
           assert.property(res.body.stockData[0], 'rel_likes');
           assert.oneOf(res.body.stockData[1].stock, ['GOOG','MSFT']);
           assert.property(res.body.stockData[1], 'stock');
           assert.property(res.body.stockData[1], 'price');
           assert.property(res.body.stockData[1], 'rel_likes');           
           assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
           assert.equal(Math.abs(res.body.stockData[0].rel_likes),rel_likes);
           done();
        });           
      });
      
    });

});


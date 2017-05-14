"use strict";

var async = require('async');
var BigNumber = require('bignumber.js');
var coopShop = artifacts.require("coopShop.sol");

var hash = web3.fromAscii('a') + "00000000000000000000000000000000000000000000000000000000000000";
var hash2 = web3.fromAscii("sdfasdf", 32) +"00000000000000000000000000000000000000000000000000";
var noBuyers = 0;
var currentPrice = web3.toWei(2, "ether");

//roles
var owner = web3.eth.accounts[0];
var delegate = web3.eth.accounts[1];
var giveth =  web3.eth.accounts[2];
var designer1 = web3.eth.accounts[3];
var designer2 = web3.eth.accounts[4];
var buyer1 = web3.eth.accounts[5];
var buyer2 = web3.eth.accounts[6];
var buyer3 = web3.eth.accounts[7];
var actor = web3.eth.accounts[9];

function expectDiffToBe(newB, oldB, diffB, msg) {
    oldB = new BigNumber(oldB);
    newB = new BigNumber(newB);
    diffB = new BigNumber(diffB);  

    assert(
        oldB.add(diffB).minus(newB).abs().lt(99000),
        msg + ". Expected " + diffB + " but got " + newB.minus(oldB)
    );
}

function expectNumbersEqual(expect, got, msg) {
    expect = new BigNumber(expect);
    got = new BigNumber(got);
    assert(expect.equals(got), msg + ". Expected " + expect + " but got " + got);
}

//function checkTX ()

contract('coop: ', function(accounts) {
//    describe('Deploy Test', function() {
//        var coop;
//        var withdraw;

        it('should have owner Set', function(done) {       

           coopShop.deployed().then(function(coop){ 
           return coop.owner().then(function (_owner) {
               assert.equal(_owner, owner, "account not set correctly");
               done()
               });    
         });
       });
        it('should have owner giveth', function(done) {

           coopShop.deployed().then(function(coop){
           return coop.giveth().then(function (_giveth) {
               assert.equal(giveth, _giveth, "giveth not set correctly");
               done();
               });
        });
        });


        it('should have owner delegate', function(done) {

           coopShop.deployed().then(function(coop){
           return coop.delegate().then(function (_delegate) {
               assert.equal(delegate, _delegate, "delegate not set correctly");
               done();
               });
        });
        });
  

       it('should add design', function(done) {

           coopShop.deployed().then(function(coop){ 
           return coop.addDesign(hash, designer1, web3.toWei(2) , {from:actor, gas:4000000}).then( function() {
                return coop.getDesignHash.call(0).then(function(des) {                              
                    
                    assert.equal(des, hash, "design not set");
                    return coop.addDesign(hash2, designer2, web3.toWei(2), {from:designer2, gas:4000000}).then( function() {
                        return coop.getDesignHash.call(1).then(function(des2) {
                             assert.equal(des, hash, "design 1 not set correctly");
                             assert.equal(des2, hash2, "design 2 not set correctly");
                             return coop.addDesign(hash2, designer2, web3.toWei(2), {from:designer2, gas:4000000}).then( function() {
                                 console.log("This should have failed to readd an old design");                             
                           
                             })
                             .catch(function (e) {
                                 console.log("this error is expected", e);
                                 done();
                             });
                        });
                    });
                });
           });
       });
       });

       it('Place Order', function(done) {

           coopShop.deployed().then(function(coop){
           var oldBalance;
           var newBalance;
           return coop.getBalance.call(buyer1,hash).then(function (oldOrder) {
               var oldBalancePcoop = web3.eth.getBalance(coop.address);
               return coop.buy("ASDSAD","ASDA", 1,hash,{from:buyer1, value: web3.toWei(2,"ether"),gas: 3141592}).then( function(bal2) {
                   var newBalancePcoop = web3.eth.getBalance(coop.address);
                   var newOrder = coop.getBalance.call(buyer1, hash).then(function(newOrder) {
                   expectDiffToBe(newBalancePcoop, oldBalancePcoop, currentPrice, "One ether should have arrived in contract.")
                   expectDiffToBe(newOrder, oldOrder, currentPrice, "Should have created order for msg.sender")
                   noBuyers++;
                   done();
              });
            });
           });
          });
        });

        it('Place Second Order For 2 uints of second design', function(done) {
           coopShop.deployed().then(function(coop){
           var oldBalance;
           var newBalance;
           return coop.getBalance.call(buyer2,hash2).then(function (oldOrder) {
               var oldBalancePcoop = web3.eth.getBalance(coop.address);
               return coop.buy("ASDSAD","ASDA", 2,hash2,{from:buyer2, value: web3.toWei(2*2,"ether"),gas: 3141592}).then( function(bal2) {
                   var newBalancePcoop = web3.eth.getBalance(coop.address);
                   var newOrder = coop.getBalance.call(buyer2, hash2).then(function(newOrder) {
                   expectDiffToBe(newBalancePcoop, oldBalancePcoop, 2*currentPrice, "One ether should have arrived in contract.")
                   expectDiffToBe(newOrder, oldOrder, 2*currentPrice, "Should have created order for msg.sender")
                   noBuyers++;
                   done();
              }); 
            });
           });
        });
        }); 


         it('Place Second Order For 3 uints of second design', function(done) {
           coopShop.deployed().then(function(coop){
           var oldBalance;
           var newBalance;

           return coop.getBalance.call(buyer3,hash2).then(function (oldOrder) {
               var oldBalancePcoop = web3.eth.getBalance(coop.address);
               return coop.buy("ASDSAD","ASDA", 3,hash2,{from:buyer3, value: web3.toWei(3*2,"ether"),gas: 3141592}).then( function(bal2) {
                   var newBalancePcoop = web3.eth.getBalance(coop.address);
                   var newOrder = coop.getBalance.call(buyer3, hash2).then(function(newOrder) {
                   expectDiffToBe(newBalancePcoop, oldBalancePcoop, 3*currentPrice, "One ether should have arrived in contract.")
                   expectDiffToBe(newOrder, oldOrder, 3*currentPrice, "Should have created order for msg.sender")
                   noBuyers++;
                   done();
              }); 
            });
           });
        });
        }); 


    it('signal Withdraw design 1' , function(done) {
       coopShop.deployed().then(function(coop){
           coop.signalWithdraw(hash , {from:owner}).then ( function (tx) {
               done();
       });
    });
    });
      
    it('signal Withdraw design 2' , function(done) {
       coopShop.deployed().then(function(coop){
           coop.signalWithdraw(hash2 , {from:owner}).then ( function (tx) {
               done();
       });
    });
    });


    it('should jump 8 days forward', function(done) {
       web3.eth.getBlock('latest', function(err, block){
           if(err) console.log(err);
           var timestampBeforeJump = block.timestamp

           web3.currentProvider.sendAsync({jsonrpc: "2.0",method: "evm_increaseTime",params: [8*24*60*60], id: new Date().           getTime()}, function(err, result) {
              if (err) return done(err);
              // Mine a block so new time is recorded.
              web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine"}, function (err, results) {
                  if (err) return done(err);
                  web3.eth.getBlock('latest', function(err, block){
                      if(err) return done(err)
                      var secondsJumped = block.timestamp - timestampBeforeJump

                      assert(secondsJumped >= 86400, "failed to jump 1 day")
                      done();
              });
            })
          })
        })
      })
 
     
	it('Withdraw design 1', function(done) {
	   coopShop.deployed().then(function(coop){
	   var oldBalance;
	   var newBalance;
           var percent = new BigNumber(70);
	   return coop.getBalance.call(buyer1,hash2).then(function (oldOrder) {
		   var oldBalancePcoop = web3.eth.getBalance(coop.address);
			   coop.withdraw(percent, hash2,{from:owner}).then (function (newOrder) {
               assert.ifError();
			   var newBalancePcoop = web3.eth.getBalance(coop.address);
			   var newOrder = coop.getBalance.call(buyer1, hash2).then(function(newOrder) {
			   expectDiffToBe(newBalancePcoop, oldBalancePcoop, -5*percent*currentPrice/100, "withdraw incorrect ether should have left the contract.");
//               expectDiffToBe(newOrder, oldOrder, 0, "Order  should have stayed the same");
               done();
              });
            });
          });
       });
    });        

    it('Withdraw design 2', function(done) {
	   coopShop.deployed().then(function(coop){
	   var oldBalance;
	   var newBalance;
       var percent = new BigNumber(70);
	   return coop.getBalance.call(buyer2,hash).then(function (oldOrder) {
		   var oldBalancePcoop = web3.eth.getBalance(coop.address);
			   coop.withdraw(percent, hash,{from:owner}).then (function (newOrder) {
               assert.ifError();
			   var newBalancePcoop = web3.eth.getBalance(coop.address);
			   var newOrder = coop.getBalance.call(buyer2, hash).then(function(newOrder) {
			   expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*currentPrice/100, "withdraw incorrect ether should have left the contract.");
//               expectDiffToBe(newOrder, oldOrder, 0, "Order  should have stayed the same");
               done();
              });
            });
          });
       });
    });        
    /*     
        it('Get 20% Refund', function(done) {
            coopShop.deployed().then(function(coop){
            var oldBalance;
            var newBalance;

             coop.refund(hash2, {from:accounts[2], gas:1000000}).then(function () {
                  assert(false, "should fail to get refund");
                  done()
                  }).catch(function (e) {
                      console.log("should fail to refund before the one week deadline", e);
                      done();
                  });
        }); 
       });*/

    it('refund 20% for design1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(20.00000000000000000);
       var vol = new BigNumber(1.00000000000000000);
       var totalPercent = new BigNumber(100.00000000000000000);

       var oldBalancePcoop =  new BigNumber(web3.eth.getBalance(coop.address));
       var oldBal =  new BigNumber(web3.eth.getBalance(buyer1));
       return coop.refund(hash, {from:buyer1}).then(function (txHash) {
           assert.ifError();
           var newBalancePcoop =  new BigNumber(web3.eth.getBalance(coop.address));
           var newBal =  new BigNumber(web3.eth.getBalance(buyer1)); 
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/totalPercent, "withdraw incorrect ether should have left the contract.");
//           expectDiffToBe(newBal, oldBal, (percent*vol*currentPrice/totalPercent) , "Refundee should have stayed recved");
           done();
          });
       });
    });

    it('refund 20% for design 2', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(20);
       var vol = new BigNumber(2);
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       var oldBal = web3.eth.getBalance(buyer2);
       return coop.refund(hash2, {from:buyer2}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(buyer2);
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/100, "withdraw incorrect ether should have left the contract.");
//           expectDiffToBe(newBal, oldBal, percent*vol*currentPrice/100, "Refundee should have stayed recved");
           done();
          });
       });
    }); 

    it('withdraw 5% for designer of design 1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5);
       var vol = new BigNumber(1);
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       var oldBal = web3.eth.getBalance(designer1);
       return coop.withdrawBenificiary(hash, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(designer1);
           
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/100, "withdraw incorrect ether should have left the contract.");
           //expectDiffToBe(newBal, oldBal, 5*percent*vol*currentPrice/100, "Refundee should have recved");
           done();
          });
       });
    }); 

    it('withdraw 5% for designer of design 2', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5.0000000000000000000000000000000000000000);
       var hundredPercent = new BigNumber(100.000000000000000000000000000000000000000);
       var vol = new BigNumber(5.0000000000000000000000000000000000000000);
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       var oldBal = web3.eth.getBalance(designer2);
       return coop.withdrawBenificiary(hash2, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(designer2);
           
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/100, "withdraw incorrect ether should have left the contract.");
//           expectDiffToBe(newBal, oldBal, percent.mul(vol.mul(currentPrice)).div(hundredPercent), "Refundee should have stayed recved");
           done();
          });
       });
    });

    it('withdraw 5% for coop from design 1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5);
       var vol = noBuyers; 
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       
       var oldBal = web3.eth.getBalance(giveth);
       return coop.withdrawOwner(hash, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(giveth);
           
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*currentPrice/new BigNumber (100.000000000000000), "withdraw incorrect ether should have left the contract.");
//           expectDiffToBe(newBal, oldBal, percent*vol*currentPrice/new BigNumber (100.000000000), "Refundee should have stayed recved");
           noBuyers--;
           done();
          });
       });
    });

    it('withdraw 5% for coop from design 2', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5);
       var vol = noBuyers; 
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       
       var oldBal = web3.eth.getBalance(giveth);
       return coop.withdrawOwner(hash2, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(giveth);
           
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -5*percent*currentPrice/new BigNumber (100.000000000000000), "withdraw incorrect ether should have left the contract.");
           //expectDiffToBe(newBal, oldBal, percent*vol*currentPrice/new BigNumber (100.000000000), "Refundee should have stayed recved");
           noBuyers--;
           done();
          });
       });
    });


    it('should jump 1 month forward', function(done) {
       web3.eth.getBlock('latest', function(err, block){
           if(err) console.log(err);
           var timestampBeforeJump = block.timestamp
           
           web3.currentProvider.sendAsync({jsonrpc: "2.0",method: "evm_increaseTime",params: [31*24*60*60], id: new Date().getTime()}, function(err, result) {
              if (err) return done(err);
              // Mine a block so new time is recorded.
              web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine"}, function (err, results) {
                  if (err) return done(err);
                  web3.eth.getBlock('latest', function(err, block){
                      if(err) return done(err)
                      var secondsJumped = block.timestamp - timestampBeforeJump
                      
                      assert(secondsJumped >= 86400, "failed to jump 1 day")
                      done();
              });
            })
          })
        })
      }) 

    it('Place Order', function(done) {
           coopShop.deployed().then(function(coop){
           var oldBalance;
           var newBalance;
           var oldBal = web3.eth.getBalance(buyer1);
           return coop.getBalance.call(buyer1,hash2).then(function (oldOrder) {
               var oldBalancePcoop = web3.eth.getBalance(coop.address);
               return coop.buy("ASDSAD","ASDA", 1,hash2,{from:buyer1, value: web3.toWei(2,"ether"),gas: 3141592}).then( function(bal2) {
                   var newBalancePcoop = web3.eth.getBalance(coop.address);
                   var newBal = web3.eth.getBalance(buyer1);
                   var newOrder = coop.getBalance.call(buyer1, hash2).then(function(newOrder) {
                   expectDiffToBe(newBalancePcoop, oldBalancePcoop, currentPrice, "One ether should have arrived in contract.")
                   expectDiffToBe(newOrder, oldOrder, currentPrice, "Should have created order for msg.sender")
                   noBuyers++;
                   done();
              });
            });
           });
          });
        });

    it('signal Withdraw design 1' , function(done) {
       coopShop.deployed().then(function(coop){
           coop.signalWithdraw(hash , {from:owner}).then ( function (tx) {
               done();
       });
    });
    });
      
    it('signal Withdraw design 2' , function(done) {
       coopShop.deployed().then(function(coop){
           coop.signalWithdraw(hash2 , {from:owner}).then ( function (tx) {
               done();
       });
    });
    });


    it('should jump 8 days forward', function(done) {
       web3.eth.getBlock('latest', function(err, block){
           if(err) console.log(err);
           var timestampBeforeJump = block.timestamp

           web3.currentProvider.sendAsync({jsonrpc: "2.0",method: "evm_increaseTime",params: [8*24*60*60], id: new Date().           getTime()}, function(err, result) {
              if (err) return done(err);
              // Mine a block so new time is recorded.
              web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine"}, function (err, results) {
                  if (err) return done(err);
                  web3.eth.getBlock('latest', function(err, block){
                      if(err) return done(err)
                      var secondsJumped = block.timestamp - timestampBeforeJump

                      assert(secondsJumped >= 86400, "failed to jump 1 day")
                      done();
              });
            })
          })
        })
      })
 

    it('Withdraw design 2', function(done) {
	   coopShop.deployed().then(function(coop){
	   var oldBalance;
	   var newBalance;
       var oldBal = web3.eth.getBalance(delegate);
       var oldBalOwner = web3.eth.getBalance(giveth);
       var percent = new BigNumber(70);

	   return coop.getBalance.call(buyer1,hash2).then(function (oldOrder) {
		   var oldBalancePcoop = web3.eth.getBalance(coop.address);
			   coop.withdraw(percent, hash2,{from:owner}).then (function (newOrder) {
               assert.ifError();
			   var newBalancePcoop = web3.eth.getBalance(coop.address);
               var newBal = web3.eth.getBalance(delegate);
               var newBalOwner = web3.eth.getBalance(giveth);
			   var newOrder = coop.getBalance.call(buyer1, hash2,{from:actor}).then(function(newOrder) {
			   expectDiffToBe(newBalancePcoop, oldBalancePcoop,(-20*3*currentPrice/100) -(percent*currentPrice/100), "withdraw incorrect ether should have left the contract.");
               expectDiffToBe(newBal, oldBal,(70*currentPrice/100), "Refundee should have stayed recved");
               expectDiffToBe(newBalOwner, oldBalOwner,(20*3*currentPrice/100), "Owner should have stayed recved");
               done();
              });
            });
          });
       });
    });        

    it('withdraw 5% for coop from design 1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5);
       var vol = noBuyers; 
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       
       var oldBal = web3.eth.getBalance(giveth);
       return coop.withdrawOwner(hash2, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(giveth);
           
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*currentPrice/new BigNumber (100.000000000000000), "withdraw incorrect ether should have left the contract.");
           expectDiffToBe(newBal, oldBal, percent*currentPrice/new BigNumber (100.000000000), "Refundee should have stayed recved");
           noBuyers--;
           done();
          });
       });
    });

    it('refund 20% for design 1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(20);
       var vol = new BigNumber(1);

       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       var oldBal = web3.eth.getBalance(buyer1);
       return coop.refund(hash2, {from:buyer1}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(buyer1);
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/100, "withdraw incorrect ether should have left the contract.");
//           expectDiffToBe(newBal, oldBal, percent*vol*currentPrice/100, "Refundee should have stayed recved");
           done();
          });
       });
    }); 

    it('withdraw 5% for designer of design 1', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       var percent = new BigNumber(5.0000000000000000000000000000000000000000);
       var hundredPercent = new BigNumber(100.000000000000000000000000000000000000000);
       var vol = new BigNumber(1.0000000000000000000000000000000000000000);
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       var oldBal = web3.eth.getBalance(designer2);
       return coop.withdrawBenificiary(hash2, {from:actor}).then(function (oldOrder) {
           assert.ifError();
           var newBalancePcoop = web3.eth.getBalance(coop.address);
           var newBal = web3.eth.getBalance(designer2);
           expectDiffToBe(newBalancePcoop, oldBalancePcoop, -percent*vol*currentPrice/100, "withdraw incorrect ether should have left the contract.");
           expectDiffToBe(newBal, oldBal, percent*vol*currentPrice/hundredPercent, "Refundee should have stayed recved");
           done();
          });
       });
    });

   it("confirm coopShop contract is empty", function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalancePcoop = web3.eth.getBalance(coop.address);
       expectDiffToBe(oldBalancePcoop,0,0, "coopShop should be empty now");
       done();
       });
   });

    it('Delete order from buyer3 who never got change', function(done) {
       coopShop.deployed().then(function(coop){
       var oldBalance;
       var newBalance;
       return coop.refund(hash2, {from:buyer3}).then(function (oldOrder) {
           assert.ifError();
           done();
          });
       });
    });

    it("confirm coopShop contract orders are all Zeros", function(done) {
       var buyers = [buyer1, buyer2, buyer3];
       var designs = [hash, hash2];
       coopShop.deployed().then(function(coop){
           buyers.forEach( function (buyer) {
               designs.forEach ( function (design) {
                   return coop.getOrders.call(buyer,design).then(function (order) {
                       expectDiffToBe(order[0],0,0, "order should be zero");
                       expectDiffToBe(order[3],0,0, "order should be zero");
                   });
               });           
           });
           done();
       });
    });

});

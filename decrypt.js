// TODO: This will return addresses for orders taht have already been 
//       fulfilled but never withdrew their refund. We should add a time
//       check to make sure these addresses are ignored. 

//TODO:  Add key encryption and decryption. Right not he priv Key is sitting
//       in plain text on the hard disk. 

//TODO:  Add threshold encryption so that a single person does not control
//       the decryption key. 

module.exports = function(callback) {
design = "QmQMJiJAizV577urzm3nenfK5PAgPhpM4H9he8n5eop1hn"

var ECIES = require("bitcore-ecies");
var bitcore = require('bitcore-lib');
var Random = bitcore.crypto.Random;
var EPC = artifacts.require("EPC.sol");
var fs = require('node-fs');

fs.readFile('./key', function read(err, data) {
    if (err) {
        throw err;
    }
    curatorKey = data.toString();
    var curatorKey = bitcore.PrivateKey(curatorKey);
    var appKey = bitcore.PrivateKey("75a4dd8197cfe1b5c6e822da07359776c179019b05def8bf9b595f2248ac1ebc");
    var curatorKey = ECIES().privateKey(curatorKey).publicKey(appKey.publicKey);
    EPC.deployed().then(function(coop){
      var event = coop.Buy({fromBlock: 0, toBlock: 'latest'});
      event.watch(function(error, response)
      {
             return coop.getOrders.call(response.args.buyer, response.args.design).then( function (order) {        
               var data = new Buffer(web3.toAscii(order[1]) , "hex");
               var decrypted = curatorKey.decrypt(data);
               console.log(decrypted.toString('ascii'));
             }).catch ( function(err) { console.log(err);})
      });
    });
});
}

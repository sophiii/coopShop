var coopShop = artifacts.require("coopShop.sol");
var Web3 = require("../node_modules/web3/");
var fs = require('../node_modules/node-fs');
var bitcore = require('../node_modules/bitcore-lib');

curatorKey = new bitcore.PrivateKey();
publicKey = curatorKey.publicKey.toString()
time = new Date()
console.log(time.toString())

var exported = curatorKey.toWIF();
console.log(curatorKey.toString());
fs.writeFile("../key_" + time.toString() , curatorKey.toString(), function(err) {
    if(err) {
        return console.log(err);
    }
});

fs.writeFile("../key" , curatorKey.toString(), function(err) {
    if(err) {
        return console.log(err);
    }
});



web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var owner = web3.eth.accounts[0];
var delegate = web3.eth.accounts[1];
var giveth = web3.eth.accounts[2];

module.exports = function(deployer) {
  deployer.deploy(coopShop, publicKey, owner,delegate, giveth, {gas:4712388} );
};

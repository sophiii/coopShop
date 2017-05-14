// TODO: Use ipfs in borowser node

var web3 = require('../../node_modules/web3');
var coopShop = require("../../build/contracts/coopShop.json");
var xss = require('xss');
var bitcore = require('../../node_modules/bitcore-lib');
var Random = bitcore.crypto.Random;
var ECIES = require("../../node_modules/bitcore-ecies");

// Import Contract
var contract = require("../../node_modules/truffle-contract");
var coopshop = contract(coopShop);

// This is a place holder. Not used for enctyption.
var appKey = bitcore.PrivateKey("75a4dd8197cfe1b5c6e822da07359776c179019b05def8bf9b595f2248ac1ebc");
var encrypt;
var ipfs;
// HTML helpers
function el (id){ return document.querySelector(id); };    
var designs = [];
var i = 0;
var image;
var blob;
var img = [];
var weiMinPrice;
//tmp

function buy() {
    coopshop.deployed().then(function(coop) {
    address = encrypt.encrypt(el('#address').value, Random.getRandomBuffer(16));
    console.log(address.toString("hex"));
    console.log(el('#hash').value);
        coop.buy(address.toString("hex"), el('#size').value, el('#quantity').value, window.web3.fromAscii(el('#hash').value), {from:window.web3.eth.accounts[0], gas:3000000, value:window.web3.toWei(el('#valueAmount').value, "ether")}).then(function(res) {
        if (res) {
             if (res == "Error: account is locked") {
                 console.log(res);
             }
             console.log(res);
             el('#response').innerHTML = 'Buy: ' + String(res.tx);
         }
      }).catch(function (err) {el('#response').innerHTML = 'Buy: ' + String(err) + "\n Try and unlock metamask";}); 
  })
}

function refund(design) {
    coopshop.deployed().then(function(coop) {
        coop.refund(design,{from:window.web3.eth.accounts[0], gas:3000000}).then(function(res) {
        if (res) {
             if (res == "Error: account is locked") {
                 console.log(res);
             }
             console.log(res);
             el('#response').innerHTML = 'Refund: ' + String(res.tx);
         }
      }).catch(function (err) {el('#response').innerHTML = 'Buy: ' + String(err);});
     })
}


function addIPFS(img, cb) {
      return ipfs.files.add(image).then(function(res) {
         cb(res);
      }).catch(function (err) {el('#response').innerHTML = "failed to connect to ipfs node: " + err;});
}

function addDesign(image) {
      coopshop.deployed().then( function(coop) {
      var element = document.getElementById('file-content');
                
                hash = image[0].hash
                return coop.addDesign(window.web3.fromAscii(hash), el('#benificiary').value, window.web3.toWei(0.1), {from:window.web3.eth.accounts[0], gas:3000000}).then(function(res){
                     el('#response').innerHTML ='Added Design TX:'+ res.tx;
                }).catch(function (err) { el('#response').innerHTML ='tx failed'+ err + "\n Try and UNLOCK metamask"; console.log(err) });

      })
}

function getImg(hash, cb) {
      var buf =  [];
      coopshop.deployed().then( function(coop) {         
           
           
           ipfs.files.cat(hash).then(function (stream) {
               stream.on('data', (file) => {
                   data =  Array.prototype.slice.call(file)
                   buf = buf.concat(data)         
               })
               stream.on('end', (file) => {
                   // garbage collect last blob
                   if (typeof blob !== 'undefined') {   
                       window.URL.revokeObjectURL(blob);
                   }
                   // create new blob
                   buf = ipfs.types.Buffer(buf);
                   blob = new Blob([buf], {type:"image/jpg"})
                   img = window.URL.createObjectURL(blob); 
                   cb();
               })
          })
      });
}

function getDesigns(coop, i){ 
    coop.getDesignHash.call(i).then(function(remote_designs) {
        remote_designs = xss(window.web3.toAscii(remote_designs))
        if (typeof remote_designs == "string" & designs.indexOf(remote_designs) == -1 ) {
            designs.push((remote_designs));
            getDesigns(coop, i+1)
        }
    }).catch ( function (err) { i = 0});
}

function readSingleFile(e) {
        var file = e.target.files[0];
        if (!file) {
          return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            image = ipfs.types.Buffer(e.target.result);
            addIPFS(image, function (hash) {
                image = hash;
                });
        };
        reader.readAsArrayBuffer(file);
        
        
   return(image);
}

function init() { 
    // IPFS
    var ipfs_node = require("ipfs");
    ipfs = new ipfs_node()

    ipfs.on('ready', () => {
      coopshop.deployed().then( function(coop) {     
        coop.publicKey.call().then(function(key) {
            key = xss(window.web3.toAscii(key))
            pubKey = new bitcore.PublicKey(key)
            encrypt = ECIES()
                .privateKey(appKey)
                .publicKey(pubKey);        
        }).catch ( function (err) { console.log(err)});       
        getDesigns(coop,0);
      });
    });
}

window.addEventListener('load', function() {
	el('#design').style.display = 'none';
        if (typeof window.web3 !== 'undefined') {
            // Use Mist/MetaMask's provider
            web3 = new web3(web3.currentProvider);           
        } else {
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            window.web3 = new web3(new Web3.providers.HttpProvider("http://localhost:8545"));            
        }
    coopshop.setProvider(window.web3.currentProvider); 
    init();
    startApp();
})

function startApp() {
    coopshop.deployed().then( function(coop) {
    el('#response').innerHTML = 'Contract deployed to address: ' + coop.address;
    el('#setOrder').addEventListener('click', function(){
        buy();
    });
    document.getElementById('design_file').addEventListener('change', readSingleFile, false);

    el('#addDesign').addEventListener('click', function(){
        addDesign(image);
    });//.catch(function(err){ console.log(err);});

    el('#placeOrder').addEventListener('click', function(){
        el('#order').style.display = 'inline';
        el('#images').style.display = 'inline';
        el('#design').style.display = 'none';
        el('#GetOrders').style.display = 'none';
    });

    el('#placeDesign').addEventListener('click', function(){
        el('#order').style.display = 'none';
        el('#GetOrders').style.display = 'none';
        el('#design').style.display = 'inline';
        el('#images').style.display = 'none';
    });

   el('#images').addEventListener('click', function(){
     
        document.getElementById("design_display").src="";
        document.getElementById("design_display").alt="Could not get img from ipfs :-/";
        i += 1

        if (i >= designs.length) {
            getDesigns(coop, i);

            document.getElementById("valueAmount").value=0.1; 
            if (i < designs.length ) { 
                i += 1;
                document.getElementById("hash").value=designs[i];   

                getImg(designs[i], function () {
                    document.getElementById("design_display").src=img; 
                 });
            }
            else { 
                i = 0;
                document.getElementById("hash").value=designs[i];    
                getImg(designs[i], function () {
                    document.getElementById("design_display").src=img;
                })
            }
        }
        else {
            document.getElementById("hash").value=designs[i];    
	    getImg(designs[i], function () {               
	        document.getElementById("design_display").src=img; 

	    })
       }
   });

   el('#GetOrders').addEventListener('click', function(event){
        if (event.target.id != 0) {
            refund(event.target.id);
        }
   });

   el('#showOrders').addEventListener('click', function(){
        el('#order').style.display = 'none';
        el('#GetOrders').style.display = 'inline';
        el('#design').style.display = 'none';
        el('#images').style.display = 'none';
        var button = '<button id="'
        var buttonEnd ='" asdf = "asdfasd" >Refund</button>'
        var tab = "<tr> <th>Design</th> <th>Quantity</th> <th>Value</th> <th>Refund</th> </tr>";
        coopshop.deployed().then(function(coop) {
        document.getElementById("OrderTable").innerHTML="";
        designs.forEach(function (design) {
            coop.getOrders.call(window.web3.eth.accounts[0], window.web3.fromAscii(design)).then( function(order){
                if (order[4] != 0 && order[0] !=0) {
                           console.log("adding order");
                           tab += "<tr> <th>" + design + "</th> <th>" + order[3] 
                                + "</th> <th>" + order[0] + "</th> <th>"
                                +button+design+buttonEnd+"</th> </tr>"
                document.getElementById("OrderTable").innerHTML=tab;
                }
            }).catch( function (err) { el('#response').innerHTML = 'ERR: ' + String(err) + "\n Try and unlock metamask"; });
		})
        });
   })
 })
}

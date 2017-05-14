## CoopShop: Ethereum Based Purchaseing Cooperative

## Dapp
http://ropsten-coopshop.netlify.com
You must start geth to allow cross domain request 
`geth --rpc --rpccorsdomain "http://http://ropsten-coopshop.netlify.com/"`
Or else use metamast/mist.

##Running local version:
start webserver: `cd app` then `webpack-dev-server --inline --content-base --port 8081`
start ethereum node: `testrpc` or  `geth --fast --testnet`
visit: `http://127.0.0.1:8081/`

##Dev Setup:
install truffle: `npm install -g truffle`
install deps: `npm install`
deploy: `truffle migrate`
build dapp: `cd app` then `webpack`

##Deployment:
Deploy the contract with `truffle migrate`

##Decryption: 
`truffle exec decrypt.js` will decrypt all addresses that are active in orders.
You must have the current private key which is stored `key` file during deployment. 


## CoopShop: Ethereum Based Purchaseing Cooperative

## Dapp
https://sophiii.github.com use metamask on ropsten

## Running local version:
start webserver: `cd app` then `webpack-dev-server --inline --content-base --port 8081`
visit: `http://127.0.0.1:8081/` with metamask

## Dev Setup:
install truffle: `npm install -g truffle`
install deps: `npm install`
deploy: `truffle migrate`
build dapp: `cd app` then `webpack`

## Deployment:
Deploy the contract with `truffle migrate`

## Decryption: 
`truffle exec decrypt.js` will decrypt all addresses that are active in orders.
You must have the current private key which is stored `key` file during deployment. 


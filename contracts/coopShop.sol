//    Copyright (C) <2016>  <0x54f59f57af2e85122572a78b56fca0017eb2c655>

//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
pragma solidity ^0.4.8;

contract Owned {
    address owner;
    /// Allows only the owner to call a function
    modifier onlyOwner { if (msg.sender != owner) throw; _;}
    event EscapeCalled(uint amount);
    function Owned() { owner = msg.sender;}
    function changeOwner(address _newOwner) onlyOwner {
        owner = _newOwner;
    }
    function getOwner() constant returns (address) {
        return owner;
    }
    function escapeHatch() onlyOwner returns (bool) {
        uint total = this.balance;
        if (!owner.send(total)) {
            throw;
        }
        EscapeCalled(total);
    }
}

contract coopShop is Owned {
    address public owner;
    address public delegate;  
    address public giveth;
    bytes [] public designs_list;
    uint public refundPercent = 90;
    uint public withdrawPercent = 0;
    uint public withdraw_time = 30 days;
    bytes public publicKey;

    struct design {
        bytes hash;
        uint vol;
        uint volOwner;
        uint volDesigner;
        uint volRefund;
        address beneficiary;
        uint timeout;
        uint refundPercent;
        uint withdrawPercent;
        uint balance;
        uint currentPrice;
        uint oldTimeout;
        uint signal;
    } 

    struct order {
        uint value;
        uint quantity;
        bytes encryptedDeliveryAddress;
        bytes size;
        uint time;
    }

    mapping (address => mapping (bytes => order)) orders;
    mapping (bytes => design) designs;

    event Buy (address buyer, bytes design); 
    event Refund (address buyer, uint refundPercent);
    event newDesign(string design);
    event Withdraw (address owner, uint withdrawPercent); 
    event WithdrawBeneficiary (address owner);
    event WithdrawOwner(address owner);

    function coopShop(bytes _publicKey, address _owner, address _delegate, address _giveth) {
        owner = _owner;
        giveth = _giveth;
        delegate = _delegate;
        publicKey = _publicKey;
    }

    function setWithdraw_time(uint _time) onlyOwner {
        withdraw_time = _time;
    }

    function setDelegate(address _del) onlyOwner {
        delegate = _del;
    }
    
    function publicKey(bytes _publicKey) onlyOwner {
        publicKey = _publicKey;
    }

    function addDesign(bytes _design, address _beneficiary, uint minPrice) {
        if (designs[_design].beneficiary != 0)  { throw; } // prevents readd of design
        designs[_design] = design(_design,0,0,0,0, _beneficiary, 0, 100, 0, 0, minPrice,0,0);
        designs_list.push(_design);
    }

    function buy(bytes encryptedDeliveryAddress, bytes size, uint quantity, bytes _design) payable {
        buyFor(msg.sender, encryptedDeliveryAddress, size, quantity, _design);
    }

    function buyFor(address _for,bytes encryptedDeliveryAddress, bytes size, uint quantity, bytes _design) payable {
        if (msg.value < designs[_design].currentPrice * quantity || quantity == 0) throw;
        if (designs[_design].hash.length == 0) throw; //if the design does not exist throw  
        if (orders[_for][_design].value != 0) throw; // there is already an order
        orders[_for][_design] = order(msg.value, quantity, encryptedDeliveryAddress, size, now);
        designs[_design].vol += quantity;
        designs[_design].balance += msg.value; 
        //generate giveth tokens
        Buy(_for, _design);
    }

    function signalWithdraw(bytes _design) onlyOwner {
       designs[_design].signal = now + 1 weeks; 
    }

    function withdraw(uint _withdrawPercent, bytes _design) onlyOwner {
        if ( designs[_design].signal > now || designs[_design].signal + 1 weeks < now ) throw;
        if (_withdrawPercent > 90) throw; //prevents the owner from steeling the binificarys funds
        if (designs[_design].timeout != 0 && designs[_design].timeout + withdraw_time > now ) throw; 
        uint funds = designs[_design].vol * designs[_design].currentPrice * _withdrawPercent/100;
        invDesignEth(funds, _design);
        invVolEth(designs[_design].vol, funds, designs[_design].currentPrice);
        if (!delegate.send(funds)) throw;

        designs[_design].withdrawPercent = _withdrawPercent;
        designs[_design].volOwner += designs[_design].vol;
        designs[_design].volDesigner += designs[_design].vol;
        designs[_design].balance -= funds;

        //donate the unclaimed change to coop dev
        funds = designs[_design].volRefund * designs[_design].currentPrice * designs[_design].refundPercent / 100;
        invDesignEth(funds, _design);
        invVolEth(designs[_design].volRefund, funds, designs[_design].currentPrice);
        if (!giveth.send(funds)) throw;
        Refund(msg.sender, funds);

        designs[_design].refundPercent = 90 - _withdrawPercent;
        designs[_design].balance -= funds;
        designs[_design].volRefund = designs[_design].vol;
        designs[_design].vol = 0;        
        designs[_design].oldTimeout = designs[_design].timeout;
        designs[_design].timeout = now;
        Withdraw(msg.sender, _withdrawPercent);
    }

    function refund(bytes _design) {       
        uint funds;
        uint vol;
        // if this is a new order return 100%
        if (orders[msg.sender][_design].time > designs[_design].timeout) {
            funds =  (designs[_design].currentPrice * orders[msg.sender][_design].quantity * 100/ 100);
            designs[_design].vol -= orders[msg.sender][_design].quantity;
        } else if (orders[msg.sender][_design].time > designs[_design].oldTimeout) {
            funds =  (designs[_design].currentPrice * orders[msg.sender][_design].quantity * designs[_design].refundPercent/ 100);
            designs[_design].volRefund -= orders[msg.sender][_design].quantity;
        } else {
            funds = 0;
        }
        invDesignEth(funds, _design);
        invVolEth(orders[msg.sender][_design].quantity, funds, designs[_design].currentPrice);
        if (!msg.sender.send(funds)) throw;
        designs[_design].balance -= funds;
        delete orders[msg.sender][_design];
        Refund(msg.sender, designs[_design].refundPercent);
    }

    function withdrawBenificiary(bytes _design) {  
        if (designs[_design].withdrawPercent == 0) throw; //only after orders have been placed
        uint funds = designs[_design].volDesigner*designs[_design].currentPrice*5/100;
        invDesignEth(funds, _design);
        invVolEth(designs[_design].volDesigner, funds, designs[_design].currentPrice);
        if (!designs[_design].beneficiary.send(funds)) throw;
        designs[_design].volDesigner = 0;
        designs[_design].balance -= funds;
        WithdrawBeneficiary(msg.sender);
    }

    function withdrawOwner(bytes _design) {  
        uint funds = designs[_design].volOwner*designs[_design].currentPrice*5/100;
        invDesignEth(funds, _design);
        invVolEth(designs[_design].volOwner, funds, designs[_design].currentPrice);
        if (!giveth.send(funds)) throw;
        designs[_design].volOwner = 0;        
    }

    function invDesignEth(uint funds, bytes _design) {
        if (funds > designs[_design].balance) throw; //invariant never remove more than is put in
    }

    function invVolEth(uint vol, uint funds, uint currentPrice) {
        if (funds > vol*currentPrice) throw;
    }

    function getOrders(address buyer, bytes _design) constant returns (uint, bytes, bytes, uint) {
        var order = orders[buyer][_design];
        return(order.value, order.encryptedDeliveryAddress, order.size, order.quantity);
    }
    
    function getBalance(address buyer, bytes _design) constant returns(uint) {
        return(orders[buyer][_design].value);
    }

    function getDesign(bytes _design) constant returns(bytes, address, uint,
                                                        uint, uint, uint, uint) {
       return(designs[_design].hash, designs[_design].beneficiary, 
              designs[_design].timeout,designs[_design].refundPercent, 
              designs[_design].balance, designs[_design].signal, 
              designs[_design].currentPrice);
    } 
    function getDesignHash(uint i) constant returns(bytes) {
        return(designs_list[i]);
    }
}

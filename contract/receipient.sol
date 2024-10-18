// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReceiptContract {
    struct Receipt {
        string totalAmount;
        string dateTime;
        string fuelQuantity;
    }

    Receipt[] public receipts;

    function storeReceipt(string memory totalAmount, string memory dateTime, string memory fuelQuantity) public {
        receipts.push(Receipt(totalAmount, dateTime, fuelQuantity));
    }

    function getReceipt(uint index) public view returns (string memory, string memory, string memory) {
        Receipt memory receipt = receipts[index];
        return (receipt.totalAmount, receipt.dateTime, receipt.fuelQuantity);
    }
}

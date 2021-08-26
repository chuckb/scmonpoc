// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;


contract Custodian {
    uint256 public totalBalance = 0;
    uint256 public withdrawFailures;
    mapping(address => uint256) private balances;

    event Deposited(
        address indexed _from,
        uint256 _amount,
        uint256 _blockNumber,
        uint256 _timeStamp
    );

    event Withdrawn(
        address indexed _to,
        uint256 _amount,
        uint256 _blockNumber,
        uint256 _timeStamp
    );

    constructor() {
    }

    function balanceOf(address _account) external view returns (uint256) {
        return balances[_account];
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        totalBalance += msg.value;
        emit Deposited(msg.sender, msg.value, block.number, block.timestamp);
    }

    function withdraw(uint256 _amount) external returns(bool) {
        if (balances[msg.sender] >= _amount) {
          msg.sender.transfer(_amount);
          balances[msg.sender] -= _amount;
          totalBalance -= _amount;
          emit Withdrawn(msg.sender, _amount, block.number, block.timestamp);
          return true;
        } else {
          withdrawFailures += 1;
          return false;
        }
    }
}
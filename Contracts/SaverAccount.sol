// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SaverNFT.sol";

struct periods {
    uint256 day;
    uint256 week;
    uint256 month;
    uint256 year;
}

contract SaverContractNFT is ReentrancyGuard {
    // Periods Intervals
    periods Intervals = periods(86400, 604800, 2629800, 31557600);
    // Owner
    address owner;
    // Timelines
    uint256 public startDate;
    uint256 public period;
    // NFT Saver Contract
    address saverAddressNFT = 0x8Da0bb16b869EE966bcF00aef7db9bEaA67eE511;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(uint256 _period) {
        owner = msg.sender;
        startDate = timestamp();
        period = Intervals.month;
        if (_period == 0) {
            period = Intervals.day;
        } else if (_period == 1) {
            period = Intervals.week;
        } else if (_period == 3) {
            period = Intervals.year;
        }
        SaverNFT InterfaceNFT = SaverNFT(saverAddressNFT);
        InterfaceNFT.addJedi(msg.sender);
    }

    // Natives Abtraction

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getBalanceECR20(address s_contract) public view returns (uint256) {
        IERC20 ERC20Contract = IERC20(s_contract);
        return ERC20Contract.balanceOf(address(this));
    }

    function changePeriod(uint256 _period) public onlyOwner {
        period = Intervals.month;
        if (_period == 0) {
            period = Intervals.day;
        } else if (_period == 1) {
            period = Intervals.week;
        } else if (_period == 3) {
            period = Intervals.year;
        }
        startDate = timestamp();
    }

    function transferNative(uint256 value, address payable to)
        public
        payable
        onlyOwner
    {
        require(address(this).balance >= value);
        require(withdrawnAvailable());
        to.transfer(value);
        startDate = timestamp();
    }

    // In case this smart contract recieve tokens or nfts as rewards

    function transferECR20(
        uint256 value,
        address to,
        address s_contract
    ) public onlyOwner {
        IERC20 ERC20Contract = IERC20(s_contract);
        require(ERC20Contract.balanceOf(address(this)) >= value);
        ERC20Contract.transfer(to, value);
    }

    function transferECR721(address to, address s_contract) public onlyOwner {
        ERC721 ERC721Contract = ERC721(s_contract);
        ERC721Contract.transferFrom(address(this), to, 0);
    }

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

    // Utilities
    function timestamp() private view returns (uint256) {
        return block.timestamp;
    }

    function withdrawnAvailable() public view returns (bool) {
        return (period <= (timestamp() - startDate));
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SaverNFT is ERC721URIStorage, ConfirmedOwner {
    // Using Utils
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 private weekPeriod = 604800;

    struct force {
        address jedi;
        uint256 lastMint;
        uint256[] history;
    }

    mapping(address => force) private _forceHistory;

    constructor() ERC721("Saver NFT", "SAVE") ConfirmedOwner(msg.sender) {}

    // Private Utils

    function timestamp() private view returns (uint256) {
        return block.timestamp;
    }

    // Public Data

    function forceHistory(address _jedi) public view returns (force memory) {
        return _forceHistory[_jedi];
    }

    function totalContent() public view virtual returns (uint256) {
        return _tokenIds.current();
    }

    // NFT Logic
    function mint(string memory _uri) public {
        require(mintAvailable(msg.sender));
        _mint(msg.sender, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), _uri);
        uint256[] storage tempHistory = _forceHistory[msg.sender].history;
        tempHistory.push(_tokenIds.current());
        _forceHistory[msg.sender] = force(msg.sender, timestamp(), tempHistory);
        _tokenIds.increment();
    }

    function mintAvailable(address _jedi) public view returns (bool) {
        uint256 lastMint = _forceHistory[_jedi].lastMint;
        if (lastMint == 0) return false;
        else return (weekPeriod <= (timestamp() - lastMint));
    }

    // Jedi Order Register
    function addJedi(address _jedi) public {
        require(_forceHistory[_jedi].lastMint == 0);
        _forceHistory[_jedi] = force(
            _jedi,
            timestamp() - weekPeriod,
            _forceHistory[_jedi].history
        );
    }
}

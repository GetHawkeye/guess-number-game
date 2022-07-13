// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "hardhat/console.sol";

contract GuessNumber {
    address public chairperson;
    uint16 count; // Number of players
    uint256 stake;
    bool gameOver; // game over flag
    bytes32 nonceHash;
    bytes32 nonceNumHash;
    struct Player {
        bool guessed; // if true, The Player has already submitted a guessing
        uint16 number; // number submitted by player
    }
    mapping(address => Player) players;
    mapping(uint16 => bool) guessedNum;
    address[] playAddress;

    event Guess(address from, uint256 number);

    event Reward(address to, uint256 rewardAmount);

    modifier isOver() {
        require(!gameOver, "Game over");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == chairperson, "Sender not authorized.");
        _;
    }

    modifier isGuessCompleted() {
        require(
            count == playAddress.length,
            "there are players who haven't guessed"
        );
        _;
    }

    constructor(bytes32 _nonceHash, bytes32 _nonceNumHash, uint8 _count) payable {
        chairperson = msg.sender;
        nonceHash = _nonceHash;
        nonceNumHash = _nonceNumHash;
        stake = msg.value;
        count = _count;
    }

    function guess(uint16 _number) external payable isOver {
        // check rules
        require(_number >= 0 && _number < 1000, "invalid number");
        require(!players[msg.sender].guessed, "already Guess");
        require(!guessedNum[_number], "number has been guessed");
        require(stake == msg.value, "stake not same value as the Host");
        players[msg.sender].guessed = true;
        players[msg.sender].number = _number;
        guessedNum[_number] = true;
        playAddress.push(msg.sender);
        emit Guess(msg.sender, _number);
    }

    function reveal(bytes32 _nonce, uint16 _number) external isOver onlyOwner isGuessCompleted {
        require(keccak256(abi.encode(_nonce)) == nonceHash, "invalid nonce");
        require(
            keccak256(abi.encode(_nonce, _number)) == nonceNumHash,
            "invalid number"
        );
        
        gameOver = true;
        
        if (_number >= 0 && _number < 1000) {
            // calculate the winner list
            address[] memory winnerList = _getWinners(_number);
            // calculate the bonus
            uint256 reward = (stake * (1 + count)) / winnerList.length;
            // send bonus
            for (uint8 p = 0; p < winnerList.length; p++) {
                payable(winnerList[p]).transfer(reward);
                emit Reward(winnerList[p], reward);
            }
        } else {
            uint256 reward = stake + (stake / count);
            // send bonus
            for (uint8 p = 0; p < count; p++) {
                payable(playAddress[p]).transfer(reward);
                emit Reward(playAddress[p], reward);
            }
        }
        
    }

    function _getWinners(uint16 _number)
        view private
        returns (address[] memory winnerList)
    {
        uint16 delta = 1000;
        uint8 winPersons = 0;
        uint16[] memory diffList = new uint16[](count);
        for (uint8 p = 0; p < count; p++) {
            uint16 pNumber = players[playAddress[p]].number;
            uint16 diff = pNumber > _number
                ? pNumber - _number
                : _number - pNumber;
            diffList[p] = diff;
            if (delta > diff) {
                delta = diff;
                winPersons = 0;
            }
            if(delta == diff){
                winPersons ++ ;
            }
        }
        uint8 j = 0;
        winnerList = new address[](winPersons);
        for (uint8 i = 0; i < count; i++) {
            if (delta == diffList[i]) {
                winnerList[j++] = playAddress[i];
            }
        }
    }
}

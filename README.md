# guess-number-game

## Introduction
This is a guessing number game contract with solidity. Game play：There are two roles in this smart contract. The “Host” and “Players”. The Host will put a commitment of a secret number in the smart contract and also deposit some rewards. The Players can try to guess what the secret number is. The player who has the closest guessing to the actual number value will win the game.

The number of players can be arbitrarily specified by the host.

The deployed Rinkby network contract address：0x982686E110971c37aB262308bc9DdB73ec209D7e

## Unit
Prepare some unit tests below:

    ✔ Case 1: Two players guess number and only one wins (54ms)
    
    ✔ Case 2: check guess() all rules (61ms)
    
    ✔ Case 3: check reveal() all rules
    
    ✔ Case 4: check game is over
    
    ✔ Case 5: Two players guess number, and there are two winners (49ms)
    
    ✔ Case 6: function reveal(): number param is not within the range of [0,1000)  (61ms)
    
    ✔ Case 7: Four players guess number and only one wins  (62ms)
    
    ✔ Case 8: Four players guess number, and there are two winners  (61ms)

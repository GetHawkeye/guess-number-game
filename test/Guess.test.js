const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Guess contract test...", function () {

  let contract;
  let nonceHash;
  let nonceNumHash;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let nonce = "HELLO";
  let number = 999;
  let n = 2;
  let options;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("GuessNumber");
    nonceHash = ethers.utils.keccak256(ethers.utils.formatBytes32String(nonce));
    nonceNumHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
        [ethers.utils.formatBytes32String(nonce), number])
    );
    options =
    {
      value: ethers.utils.parseEther("1")
    };
    contract = await contractFactory.deploy(nonceHash, nonceNumHash, n, options);
    //console.log("deploy Contract address:", contract.address);

  });
  it("Case 1: Two players guess the prize and only one wins", async function () {

    await contract.connect(addr1).guess(800, options);

    await contract.connect(addr2).guess(900, options);

    await expect(
      await contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.changeEtherBalance(addr2, ethers.utils.parseEther("3"));

  });

  it("Case 2: check guess() all rules", async function () {
    const options1 = {
      value: ethers.utils.parseEther("2"),
      gasPrice: 20000000150
    };
    await expect(
      contract.connect(addr1).guess(800, options1)
    ).to.be.revertedWith("stake not same value as the Host");

    await expect(
      contract.connect(addr1).guess(1800, options)
    ).to.be.revertedWith("invalid number");

    await contract.connect(addr1).guess(800, options);

    await expect(
      contract.connect(addr1).guess(800, options)
    ).to.be.revertedWith("already Guess");

    await expect(
      contract.connect(addr2).guess(800, options)
    ).to.be.revertedWith("number has been guessed");

  });

  it("Case 3: check reveal() all rules", async function () {

    await contract.connect(addr1).guess(800, options);
    await contract.connect(addr2).guess(900, options);

    await expect(
      contract.reveal(ethers.utils.formatBytes32String(nonce), 600)
    ).to.be.revertedWith("invalid number");

    await expect(
      contract.reveal(ethers.utils.formatBytes32String("nonce"), number)
    ).to.be.revertedWith("invalid nonce");

  });

  it("Case 4: check game is over", async function () {

    await contract.connect(addr1).guess(800, options);
    await contract.connect(addr2).guess(900, options);
    await contract.reveal(ethers.utils.formatBytes32String(nonce), number);

    await expect(
      contract.connect(addr2).guess(900, options)
    ).to.be.revertedWith("Game over");

    await expect(
      contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.be.revertedWith("Game over");


  });


  it("Case 5: Two players guess the prize, and there are two winners", async function () {

    const contractFactory = await ethers.getContractFactory("GuessNumber");
    number = 500;
    nonceNumHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
        [ethers.utils.formatBytes32String(nonce), number])
    );
    const options =
    {
      value: ethers.utils.parseEther("1")
    };

    contract = await contractFactory.deploy(nonceHash, nonceNumHash, n, options);

    await contract.connect(addr1).guess(450, options);

    await contract.connect(addr2).guess(550, options);
    await expect(
      await contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.changeEtherBalances([addr1, addr2], [ethers.utils.parseEther("1.5"), ethers.utils.parseEther("1.5")]);

  });

  it("Case 6: function reveal(): number param is not within the range of [0,1000) ", async function () {

    const contractFactory = await ethers.getContractFactory("GuessNumber");
    number = 1415;
    nonceNumHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
        [ethers.utils.formatBytes32String(nonce), number])
    );
    const options =
    {
      value: ethers.utils.parseEther("1")
    };
    contract = await contractFactory.deploy(nonceHash, nonceNumHash, n, options);

    await contract.connect(addr1).guess(450, options);

    await contract.connect(addr2).guess(550, options);

    await expect(
      await contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.changeEtherBalances([addr1, addr2], [ethers.utils.parseEther("1.5"), ethers.utils.parseEther("1.5")]);

  });


  it("Case 7: Four players guess the prize and only one wins ", async function () {

    const contractFactory = await ethers.getContractFactory("GuessNumber");
    number = 800;
    nonceNumHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
        [ethers.utils.formatBytes32String(nonce), number])
    );
    const options =
    {
      value: ethers.utils.parseEther("1")
    };
    contract = await contractFactory.deploy(nonceHash, nonceNumHash, 4, options);

    await contract.connect(addr1).guess(450, options);
    await contract.connect(addr2).guess(700, options);
    await contract.connect(addr3).guess(800, options);
    await contract.connect(addr4).guess(900, options);

    await expect(
      await contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.changeEtherBalance(addr3, ethers.utils.parseEther("5"));

  });

  it("Case 8: Four players guess the prize, and there are two winners ", async function () {

    const contractFactory = await ethers.getContractFactory("GuessNumber");
    number = 800;
    nonceNumHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
        [ethers.utils.formatBytes32String(nonce), number])
    );
    const options =
    {
      value: ethers.utils.parseEther("1")
    };
    contract = await contractFactory.deploy(nonceHash, nonceNumHash, 4, options);

    await contract.connect(addr1).guess(450, options);
    await contract.connect(addr2).guess(780, options);
    await contract.connect(addr3).guess(820, options);
    await contract.connect(addr4).guess(900, options);

    await expect(
      await contract.reveal(ethers.utils.formatBytes32String(nonce), number)
    ).to.changeEtherBalances([addr2, addr3], [ethers.utils.parseEther("2.5"), ethers.utils.parseEther("2.5")]);

  });


});

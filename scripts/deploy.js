async function main() {
  const [deployer] = await ethers.getSigners();

  const nonce = "HELLO";
  const number = 999;
  const stake = "0.001";
  const n = 2;

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:%s, nonce = %s, number = %s, stake = %s", 
  (await deployer.getBalance()).toString(),nonce,number,stake);

  const guessNumber = await ethers.getContractFactory("GuessNumber");
  
  const nonceHash = ethers.utils.keccak256(ethers.utils.formatBytes32String(nonce));
  const nonceNumHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["bytes32", "uint"],
      [ethers.utils.formatBytes32String(nonce), number])
  );
  const options =
  {
    value: ethers.utils.parseEther(stake)
  };

  const guessNumberContract = await guessNumber.deploy(nonceHash,nonceNumHash,n,options);

  console.log("deploy Contract address:", guessNumberContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

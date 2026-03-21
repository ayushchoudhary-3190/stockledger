const hre = require("hardhat");

const INITIAL_PRICES = {
  AAPL: 175,
  TSLA: 250,
  MSFT: 350
};

const POOL_LIQUIDITY_USD = "150000";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy StableCoin (USD)
  console.log("\nDeploying StableCoin (USD)...");
  const StableCoin = await hre.ethers.getContractFactory("Token");
  const usdDecimals = 18;
  const usdInitialSupply = hre.ethers.parseUnits("1000000", usdDecimals); // 1M initial supply
  const stableCoin = await StableCoin.deploy("USD Stablecoin", "USD", usdDecimals, usdInitialSupply);
  await stableCoin.waitForDeployment();
  const usdAddress = await stableCoin.getAddress();
  console.log("StableCoin deployed to:", usdAddress);

  // Deploy Stock Tokens
  const stockTokens = {};
  const poolAmount = hre.ethers.parseUnits(POOL_LIQUIDITY_USD, 18);

  for (const [symbol, price] of Object.entries(INITIAL_PRICES)) {
    console.log(`\nDeploying ${symbol} token (price: $${price})...`);
    
    const stockAmount = hre.ethers.parseUnits((POOL_LIQUIDITY_USD / price).toFixed(8), 18);
    const stockToken = await StableCoin.deploy(
      `${symbol} Stock`,
      symbol,
      18,
      stockAmount
    );
    await stockToken.waitForDeployment();
    const tokenAddress = await stockToken.getAddress();
    stockTokens[symbol] = tokenAddress;
    console.log(`${symbol} deployed to:`, tokenAddress);
  }

  // Log deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("USD Token:", usdAddress);
  console.log("AAPL Token:", stockTokens.AAPL);
  console.log("TSLA Token:", stockTokens.TSLA);
  console.log("MSFT Token:", stockTokens.MSFT);

  // Save deployment addresses
  const fs = require("fs");
  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokens: {
      USD: usdAddress,
      AAPL: stockTokens.AAPL,
      TSLA: stockTokens.TSLA,
      MSFT: stockTokens.MSFT
    }
  };

  fs.writeFileSync(
    "./deployments/" + hre.network.name + "-deployment.json",
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("\nDeployment addresses saved to deployments/" + hre.network.name + "-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { ApolloFetch } from "apollo-fetch";
import { assert, expect } from "chai";
import hre ,{ ethers } from "hardhat";
import path from "path";
import { ERC20PriceOracleVaultFactory} from "../typechain/ERC20PriceOracleVaultFactory";
import { TwoPriceOracleFactory} from "../typechain/TwoPriceOracleFactory";
import * as Util from "./utils/utils";

export let erc20PriceOracleVaultFactory: ERC20PriceOracleVaultFactory;
export let twoPriceOracleFactory: TwoPriceOracleFactory
let subgraphName = "rain-protocol/offchainAssetVault";
export let subgraph: ApolloFetch;

before("Deploy ERC20PriceOracleVaultFactory and TwoPriceOracleFactory", async () => {
    const VaultFactory = await ethers.getContractFactory("ERC20PriceOracleVaultFactory");
    erc20PriceOracleVaultFactory = await VaultFactory.deploy() as ERC20PriceOracleVaultFactory;
    await erc20PriceOracleVaultFactory.deployed();

    const OracleFactory = await ethers.getContractFactory("TwoPriceOracleFactory");
    twoPriceOracleFactory = await OracleFactory.deploy() as TwoPriceOracleFactory;
    await twoPriceOracleFactory.deployed();

    const pathExampleConfig = path.resolve(
        __dirname,
        `../config/${hre.network.name}.json`
      );
    const config = JSON.parse(Util.fetchFile(pathExampleConfig));

    config.network = hre.network.name;

    config.ERC20PriceOracleVaultFactory = erc20PriceOracleVaultFactory.address;
    config.ERC20PriceOracleVaultFactoryBlock = erc20PriceOracleVaultFactory.deployTransaction.blockNumber;
    
    config.TwoPriceOracleFactory = twoPriceOracleFactory.address;
    config.TwoPriceOracleFactoryBlock = twoPriceOracleFactory.deployTransaction.blockNumber;

    Util.writeFile(pathExampleConfig, JSON.stringify(config, null, 2));

    const deployConfigExPath = path.resolve(
        __dirname,
        "../scripts/deployConfig.example.json"
      );
    
      const deployConfig = JSON.parse(Util.fetchFile(deployConfigExPath));
    
      // Setting all to localhost to test locally
      deployConfig.subgraphName = "gild-lab/ethgild";
      deployConfig.configPath = `config/${hre.network.name}.json`;
      deployConfig.endpoint = "http://localhost:8020/";
      deployConfig.ipfsEndpoint = "http://localhost:5001";
      deployConfig.versionLabel = "1.0.0";
    
      // Write to the deployment configuration
      const deployConfigPath = path.resolve(
        __dirname,
        "../scripts/deployConfig.json"
      );
    
      Util.writeFile(deployConfigPath, JSON.stringify(deployConfig, null, 2));
    
      Util.exec(`npm run deploy-subgraph`);
    
      subgraph = Util.fetchSubgraph(subgraphName);
});
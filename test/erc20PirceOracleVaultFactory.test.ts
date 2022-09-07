import { FetchResult } from "apollo-fetch";
import { assert, expect } from "chai";
import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { TestErc20 } from "../typechain";
import { NewChildEvent } from "../typechain/ERC20PriceOracleVaultFactory";
import { erc20PriceOracleVaultFactory, subgraph, twoPriceOracleFactory } from "./deployFactories.test";
import { deployTwoPriceOracle, getEventArgs, waitForSubgraphToBeSynced } from "./utils/utils";

let vaultTrx: ContractTransaction;
describe("ERC20PriceOracleVaultFactory Test", () => {
  before(async () => {
    const testErc20 = await ethers.getContractFactory("TestErc20");
    const testErc20Contract = (await testErc20.deploy()) as TestErc20;
    await testErc20Contract.deployed();

    const constructionConfig = {
      asset: testErc20Contract.address,
      name: "EthGild",
      symbol: "ETHg",
      uri: "ipfs://bafkreiahuttak2jvjzsd4r62xoxb4e2mhphb66o4cl2ntegnjridtyqnz4",
    };

    const trx = await deployTwoPriceOracle(twoPriceOracleFactory);
    const [sender, child] = await getEventArgs(trx, "NewChild", twoPriceOracleFactory);

    vaultTrx = await erc20PriceOracleVaultFactory.createChildTyped({
        priceOracle: child,
        receiptVaultConfig: constructionConfig
    })

    await waitForSubgraphToBeSynced(1000);
});

it("Should create correct erc20PriceOracleVault entity",async () => {
    const [sender_, child_] = await getEventArgs(vaultTrx, "NewChild", erc20PriceOracleVaultFactory) as NewChildEvent["args"];
    expect(child_).to.not.null;

    const query = `{
      erc20PriceOracleVaultFactory(id: "${erc20PriceOracleVaultFactory.address.toLowerCase()}"){
        childrenCount
        children{
          id
          deployBlock
          erc20PriceOracleVaultFactory{
            id
          }
        }
      }
    }`;

    const response = (await subgraph({query: query})) as FetchResult;
    const erc20PriceOracleVaultFactory_ = response.data.erc20PriceOracleVaultFactory;
    assert.equal(erc20PriceOracleVaultFactory_.childrenCount, "1");
    expect(erc20PriceOracleVaultFactory_.children).to.lengthOf(1);

    const erc20PriceOracleVault = erc20PriceOracleVaultFactory_.children[0];
    assert.equal(erc20PriceOracleVault.id, child_.toLowerCase());
    assert.equal(erc20PriceOracleVault.erc20PriceOracleVaultFactory.id, erc20PriceOracleVaultFactory.address.toLowerCase());
  });

});

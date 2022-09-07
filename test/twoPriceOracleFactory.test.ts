import { FetchResult } from "apollo-fetch";
import { assert, expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { NewChildEvent } from "../typechain/TwoPriceOracleFactory";
import { subgraph, twoPriceOracleFactory } from "./deployFactories.test";
import { deployTwoPriceOracle, getEventArgs, waitForSubgraphToBeSynced } from "./utils/utils";

let trx: ContractTransaction;
export const usdDecimals = 8;
export const xauDecimals = 8;
export const quotePrice = BigNumber.from("186051000000");
export const basePrice = BigNumber.from("167917253245");

describe("TwoPriceOracleFactory test", () => {
  before(async () => {
    trx = await deployTwoPriceOracle(twoPriceOracleFactory);
    await waitForSubgraphToBeSynced(1000);
  });

  it("Should create correct TwoPriceOracle entity",async () => {
    const [sender, child] = await getEventArgs(trx, "NewChild", twoPriceOracleFactory) as NewChildEvent["args"];
    expect(child).to.not.null;

    const query = `{
      twoPriceOracleFactory(id: "${twoPriceOracleFactory.address.toLowerCase()}"){
        childrenCount
        id
        address
        children{
          id
          value
          factory{
            id
          }
        }
      }
    }`;

    const response = (await subgraph({query:query})) as FetchResult;
    const _twoPriceOracleFactory = response.data.twoPriceOracleFactory;
    assert.equal(_twoPriceOracleFactory.childrenCount, 2);
    assert.equal(_twoPriceOracleFactory.id, twoPriceOracleFactory.address.toLowerCase());
    assert.equal(_twoPriceOracleFactory.address, twoPriceOracleFactory.address.toLowerCase());
    expect(_twoPriceOracleFactory.children).to.lengthOf(2);

    const _twoPriceOracle = _twoPriceOracleFactory.children[0];
    assert(_twoPriceOracle.id, child);
    assert(_twoPriceOracle.factory.id, twoPriceOracleFactory.address.toLowerCase());
    assert(_twoPriceOracle.value, basePrice.div(quotePrice).toString());
  });

});

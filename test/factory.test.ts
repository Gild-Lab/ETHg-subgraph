import { expect } from "chai";
import { erc20PriceOracleVaultFactory, twoPriceOracleFactory } from "./deployFactories.test";

describe("Factory Test", () => {
    it("Factories Should deployed",async () => {
        expect(erc20PriceOracleVaultFactory.address).to.not.null;
        expect(twoPriceOracleFactory.address).to.not.null;
    });
});
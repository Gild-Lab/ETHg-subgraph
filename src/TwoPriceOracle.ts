import { TwoPriceOracle } from '../generated/schema'
import { Construction, TwoPriceOracle as TwoPriceOracleContract } from '../generated/templates/TwoPriceOracleTemplate/TwoPriceOracle'
export function handleConstruction(event: Construction): void {
    let twoPriceOracle = TwoPriceOracle.load(event.address.toHex());
    let contract = TwoPriceOracleContract.bind(event.address);
    if(twoPriceOracle){
        twoPriceOracle.value = contract.price();
        twoPriceOracle.save();
    }
}
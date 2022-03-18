
import {ChainlinkFeedPriceOracle, Construction } from "../generated/ChainlinkFeedPriceOracle/ChainlinkFeedPriceOracle"
import { GoldPrice } from "../generated/schema"

export function handleConstruction(event: Construction): void {
let contract = ChainlinkFeedPriceOracle.bind(event.address)
    contract.price()

    let entity = GoldPrice.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new GoldPrice(event.transaction.hash.toHex())
    }

    entity.value = contract.price()
    entity.save()
}


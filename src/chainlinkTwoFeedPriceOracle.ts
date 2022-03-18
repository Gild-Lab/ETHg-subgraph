import {ChainlinkTwoFeedPriceOracle, Construction } from "../generated/ChainlinkTwoFeedPriceOracle/ChainlinkTwoFeedPriceOracle"
import { ReferencePrice } from "../generated/schema"

export function handleConstruction(event: Construction): void {
    let contract = ChainlinkTwoFeedPriceOracle.bind(event.address)
    contract.price()

    let entity = ReferencePrice.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new ReferencePrice(event.transaction.hash.toHex())
    }
    entity.value = contract.price()
    entity.save()
}



import {ChainlinkTwoFeedPriceOracle, Construction } from "../generated/ChainlinkTwoFeedPriceOracle/ChainlinkTwoFeedPriceOracle"
import { ReferencePrice } from "../generated/schema"
import { ethereum } from '@graphprotocol/graph-ts'


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

// export function handleBlock(block: ethereum.Block): void {
//   let id = block.hash.toHex()
//   let entity = new ReferencePrice(id)
//   entity.save()
// }
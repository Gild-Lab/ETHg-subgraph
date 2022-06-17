import {ChainlinkTwoFeedPriceOracle, Construction } from "../generated/ChainlinkTwoFeedPriceOracle/ChainlinkTwoFeedPriceOracle"
import { Block, ReferencePrice } from "../generated/schema"
import { ethereum, dataSource} from '@graphprotocol/graph-ts'


export function handleConstruction(event: Construction): void {
    let contract = ChainlinkTwoFeedPriceOracle.bind(event.address)

    let entity = ReferencePrice.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new ReferencePrice(event.transaction.hash.toHex())
    }

    const price = contract.try_price()
    if(!price.reverted)
    entity.value = price.value
    entity.save() 
}

export function handleBlock(block: ethereum.Block): void {
  let id = block.hash.toHex()

  let contract = ChainlinkTwoFeedPriceOracle.bind(dataSource.address())

  let blockEntity = new Block(id)
  blockEntity.hash = block.hash;
  blockEntity.parentHash = block.parentHash;
  const price = contract.try_price()
  if(!price.reverted)
    blockEntity.priceValue = price.value
  
  blockEntity.number = block.number;
  blockEntity.save()
}
import { BigInt } from "@graphprotocol/graph-ts"
import {
  NativeGild,
  Approval,
  ApprovalForAll,
  Construction,
  Gild as GildEvent,
  Transfer,
  TransferBatch,
  TransferSingle,
  URI,
  Ungild as UngildEvent
} from "../generated/NativeGild/NativeGild"
import { Gild, Ungild } from "../generated/schema"

export function handleApproval(event: Approval): void {
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleConstruction(event: Construction): void {
}

export function handleGild(event: GildEvent): void {
  let entity = Gild.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new Gild(event.transaction.hash.toHex())
  }
  entity.sender = event.params.sender
  entity.amount =   event.params.amount
  entity.price =   event.params.price
  entity.save()
}

export function handleTransfer(event: Transfer): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {}

export function handleURI(event: URI): void {}

export function handleUngild(event: UngildEvent): void {
  let entity = Ungild.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new Ungild(event.transaction.hash.toHex())
  }
  entity.sender = event.params.sender
  entity.amount =   event.params.amount
  entity.price =   event.params.price
  entity.save()
}

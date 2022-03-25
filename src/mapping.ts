import { BigInt,  ethereum, Address } from "@graphprotocol/graph-ts"
import {
  NativeGild,
  Approval,
  ApprovalForAll,
  Construction as ConstructionEvent,
  Gild as GildEvent,
  Transfer,
  TransferBatch,
  TransferSingle,
  URI,
  Ungild as UngildEvent
} from "../generated/NativeGild/NativeGild"

import { Gild, Ungild, Construction, Account, ERC20Transfer, ERC1155Contract, ERC1155Transfer } from "../generated/schema"
import {
	fetchERC20,
	fetchERC20Approval,
  fetchERC20Balance
} from './fetch/erc20'

import {
	fetchERC1155,
	fetchERC1155Token,
	fetchERC721Operator,
	fetchERC1155Balance
} from './fetch/erc1155'

import {
	fetchAccount,
} from './fetch/account'

import {
	decimals,
  events, 
  transactions,
  constants
} from '@amxx/graphprotocol-utils'


import {ChainlinkTwoFeedPriceOracle } from "../generated/ChainlinkTwoFeedPriceOracle/ChainlinkTwoFeedPriceOracle"


function registerTransfer(
	event:    ethereum.Event,
	suffix:   string,
	contract: ERC1155Contract,
	operator: Account,
	from:     Account,
	to:       Account,
	id:       BigInt,
	value:    BigInt)
: void
{
	let token      = fetchERC1155Token(contract, id)
	let ev         = new ERC1155Transfer(events.id(event).concat(suffix))
	ev.emitter     = token.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.token       = token.id
	ev.operator    = operator.id
	ev.value       = decimals.toDecimals(value)
	ev.valueExact  = value

	if (from.id == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchERC1155Balance(token, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact)
		totalSupply.save()
	} else {
		let balance            = fetchERC1155Balance(token, from)
		balance.valueExact     = balance.valueExact.minus(value)
		balance.value          = decimals.toDecimals(balance.valueExact)
		balance.save()

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (to.id == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchERC1155Balance(token, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact)
		totalSupply.save()
	} else {
		let balance            = fetchERC1155Balance(token, to)
		balance.valueExact     = balance.valueExact.plus(value)
		balance.value          = decimals.toDecimals(balance.valueExact)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}

	token.save()
	ev.save()
}

export function handleApproval(event: Approval): void {
  let contract = fetchERC20(event.address)

	let owner           = fetchAccount(event.params.owner)
	let spender         = fetchAccount(event.params.spender)
	let approval        = fetchERC20Approval(contract, owner, spender)
	approval.valueExact = event.params.value
	approval.value      = decimals.toDecimals(event.params.value, contract.decimals)
	approval.save()
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let contract         = fetchERC1155(event.address)
	let owner            = fetchAccount(event.params.account)
	let operator         = fetchAccount(event.params.operator)
	let delegation       = fetchERC721Operator(contract, owner, operator)
	delegation.approved  = event.params.approved
	delegation.save()
}

export function handleConstruction(event: ConstructionEvent): void {
  let eve = Construction.load(event.transaction.hash.toHex())
  if (!eve) {
    eve = new Construction(event.transaction.hash.toHex())
  }
  
  eve.priceOracle =  event.params.config.priceOracle
  eve.sender =   event.params.sender
  eve.name = event.params.config.name
  eve.symbol = event.params.config.symbol
  eve.uri = event.params.config.uri
  eve.erc20OverburnNumerator = event.params.config.erc20OverburnNumerator
  eve.erc20OverburnDenominator = event.params.config.erc20OverburnDenominator

  eve.save()
}

export function handleGild(event: GildEvent): void {


    let contract = NativeGild.bind(event.address)
    contract.balanceOf1(event.params.sender)

    // let entity = ReferencePrice.load(event.transaction.hash.toHex())
    // if (!entity) {
    //   entity = new ReferencePrice(event.transaction.hash.toHex())
    // }
    // entity.value = contract.price()
    // entity.save()

  let entity = Gild.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new Gild(event.transaction.hash.toHex())
  }
  entity.sender = event.params.sender
  entity.amount = event.params.amount
  entity.price = event.params.price
  entity.save()
}

export function handleTransfer(event: Transfer): void {
  let contract   = fetchERC20(event.address)
	let ev         = new ERC20Transfer(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.value       = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact  = event.params.value

	if (event.params.from.toHex() == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let from               = fetchAccount(event.params.from)
		let balance            = fetchERC20Balance(contract, from)
		balance.valueExact     = balance.valueExact.minus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (event.params.to.toHex() == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let to                 = fetchAccount(event.params.to)
		let balance            = fetchERC20Balance(contract, to)
		balance.valueExact     = balance.valueExact.plus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}
	ev.save()
}

export function handleTransferBatch(event: TransferBatch): void {
	let contract = fetchERC1155(event.address)
	let operator = fetchAccount(event.params.operator)
	let from     = fetchAccount(event.params.from)
	let to       = fetchAccount(event.params.to)

	let ids    = event.params.ids
	let values = event.params.values
	for (let i = 0;  i < ids.length; ++i)
	{
		registerTransfer(
			event,
			"/".concat(i.toString()),
			contract,
			operator,
			from,
			to,
			ids[i],
			values[i]
		)
	}
}

export function handleTransferSingle(event: TransferSingle): void {
	let contract = fetchERC1155(event.address)
	let operator = fetchAccount(event.params.operator)
	let from     = fetchAccount(event.params.from)
	let to       = fetchAccount(event.params.to)

	registerTransfer(
		event,
		"",
		contract,
		operator,
		from,
		to,
		event.params.id,
		event.params.value
	)
}

export function handleURI(event: URI): void {
  let contract = fetchERC1155(event.address)
	let token    = fetchERC1155Token(contract, event.params.id)
	token.uri    = event.params.value
	token.save()
}

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

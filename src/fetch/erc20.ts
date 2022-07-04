import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Account,
	erc20Contract,
	ERC20Balance,
	ERC20Approval,
} from '../../generated/schema'

import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount
} from './account'

export function fetchERC20(address: Address): erc20Contract {
	let account  = fetchAccount(address)
	let contract = erc20Contract.load(account.id)

	if (contract == null) {
		// let endpoint              = erc20Contract.bind(address)
		// let name                  = endpoint.try_name()
		// let symbol                = endpoint.try_symbol()
		// let decimals              = endpoint.try_decimals()
		contract                  = new erc20Contract(account.id)

		// // Common
		// contract.name        = name.reverted     ? null : name.value
		// contract.symbol      = symbol.reverted   ? null : symbol.value
		contract.decimals    = 18
		contract.totalSupply = fetchERC20Balance(contract as erc20Contract, null).id
		contract.asAccount   = account.id
		account.asERC20      = contract.id
		contract.save()
		account.save()
	}

	return contract as erc20Contract
}

export function fetchERC20Balance(contract: erc20Contract, account: Account | null): ERC20Balance {
	let id      = contract.id.concat('/').concat(account ? account.id : 'totalSupply')
	let balance = ERC20Balance.load(id)

	if (balance == null) {
		balance                 = new ERC20Balance(id)
		balance.contract        = contract.id
		balance.account         = account ? account.id : null
		balance.value           = constants.BIGDECIMAL_ZERO
		balance.valueExact      = constants.BIGINT_ZERO
		balance.save()
	}

	return balance as ERC20Balance
}

export function fetchERC20Approval(contract: erc20Contract, owner: Account, spender: Account): ERC20Approval {
	let id       = contract.id.concat('/').concat(owner.id).concat('/').concat(spender.id)
	let approval = ERC20Approval.load(id)

	if (approval == null) {
		approval                = new ERC20Approval(id)
		approval.contract       = contract.id
		approval.owner          = owner.id
		approval.spender        = spender.id
		approval.value          = constants.BIGDECIMAL_ZERO
		approval.valueExact     = constants.BIGINT_ZERO
	}

	return approval as ERC20Approval
}

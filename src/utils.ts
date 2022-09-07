import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Account,
  ERC1155Balance,
  ERC1155Contract,
  ERC1155Token,
  ERC20Balance,
  Erc20PriceOracleVault,
  Transaction,
} from "../generated/schema";

import { Erc20PriceOracleVault as ERC1155 } from "../generated/templates/Erc20PriceOracleVaultTemplate/Erc20PriceOracleVault";
export let ZERO_ADDRESS = Address.fromI32(0);
export let ZERO_BI = BigInt.fromI32(0);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BI = BigInt.fromI32(1);
export let ONE_BD = BigDecimal.fromString("1");

export function getAccount(
  address: string,
  erc20PriceOracleVault: string
): Account {
  let account = Account.load(erc20PriceOracleVault + "-" + address);
  let erc20PriceOracleVault_ = Erc20PriceOracleVault.load(
    erc20PriceOracleVault
  );
  if (!account && erc20PriceOracleVault_) {
    account = new Account(erc20PriceOracleVault + "-" + address);
    account.erc20PriceOracleVault = erc20PriceOracleVault_.id;
    account.address = Address.fromHexString(address);
    account.save();
  }
  return account as Account;
}

export function getERC1155Contract(address: string): ERC1155Contract {
  let contract = ERC1155Contract.load(address);
  if (!contract) {
    contract = new ERC1155Contract(address);
    contract.address = Address.fromHexString(address);
    contract.save();
  }
  return contract;
}

export function toDecimals(value: BigInt, decimals: number = 18): BigDecimal {
  let precision = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return value.divDecimal(precision);
}

export function getTransaction(block: ethereum.Block, id: string): Transaction {
  let transaction = Transaction.load(id);
  if (!transaction) {
    transaction = new Transaction(id);
    transaction.timestamp = block.timestamp;
    transaction.blockNumber = block.number;
    transaction.save();
  }
  return transaction;
}

export function getERC20Balance(
  address: string,
  erc20PriceOracleVault: string
): ERC20Balance {
  let erc20Balance = ERC20Balance.load(address + "-" + erc20PriceOracleVault);
  if(!erc20Balance){
    erc20Balance = new ERC20Balance(address + "-" + erc20PriceOracleVault);
    erc20Balance.account = getAccount(address, erc20PriceOracleVault).id;
    erc20Balance.contract = erc20PriceOracleVault;
    erc20Balance.value = ZERO_BD;
    erc20Balance.valueExact = ZERO_BI;
    erc20Balance.save();
  }
  return erc20Balance;
}

export function getERC1155Token(tokenId: BigInt, contract: string): ERC1155Token{
  let token =  ERC1155Token.load(contract + "-" + tokenId.toString());
  let erc1155 = ERC1155.bind(Address.fromString(contract));
  if(!token){
    token = new ERC1155Token(contract + "-" + tokenId.toString());
    token.contract = contract;
    token.uri = erc1155.uri(tokenId);
    token.totalSupply = ZERO_BI;
    token.save();
  }
  return token;
}

export function getERC1155Balance(account: string, contract: string, tokenId: BigInt): ERC1155Balance {
  let erc1155Balance = ERC1155Balance.load(contract + "-" + account);
  if(!erc1155Balance){
    erc1155Balance = new ERC1155Balance(contract + "-" + account);
    erc1155Balance.account = getAccount(account, contract).id;
    erc1155Balance.token = getERC1155Token(tokenId, contract).id;
    erc1155Balance.contract = contract;
    erc1155Balance.value = ZERO_BI;
  }
  return erc1155Balance;
}
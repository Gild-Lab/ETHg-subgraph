import {
  Deposit,
  ERC1155Approval,
  ERC1155Transfer,
  ERC20Approval,
  Erc20PriceOracleVault,
  ERC20Transfer,
  Transaction,
  Withdraw
} from "../generated/schema";
import {
  Approval,
  ERC20PriceOracleVaultConstruction,
  Erc20PriceOracleVault as Contract,
  ApprovalForAll,
  Deposit as DepositEvent,
  Transfer,
  TransferSingle,
  TransferBatch,
  URI,
  Withdraw as WithdrawEvent
} from "../generated/templates/Erc20PriceOracleVaultTemplate/Erc20PriceOracleVault";
import {
  getAccount,
  getERC1155Balance,
  getERC1155Contract,
  getERC1155Token,
  getERC20Balance,
  getTransaction,
  toDecimals,
  ZERO_ADDRESS,
} from "./utils";
import { BigInt } from "@graphprotocol/graph-ts";

function updateERC1155Balance(
  from: string,
  to: string,
  operator: string,
  tokenId: BigInt,
  value: BigInt,
  contract: string,
  transaction: Transaction
): void {
  let operator_ = getAccount(operator, contract);
  let token = getERC1155Token(tokenId, contract);

  let erc1155Transfer = new ERC1155Transfer(transaction.id);
  erc1155Transfer.contract = contract;
  erc1155Transfer.emitter = operator_.id;
  erc1155Transfer.value = value;
  erc1155Transfer.timestamp = transaction.timestamp;

  if (to == ZERO_ADDRESS.toHex()) {
    token.totalSupply = token.totalSupply.minus(value);
  } else {
    let receiver = getAccount(to, contract);
    let receiverBalance = getERC1155Balance(receiver.id, contract, tokenId);
    if (receiverBalance) {
      receiverBalance.value = receiverBalance.value.plus(value);
      receiverBalance.save();
    }
    erc1155Transfer.to = receiver.id;
    erc1155Transfer.toBalance = receiverBalance.id;
  }

  if (from == ZERO_ADDRESS.toHex()) {
    token.totalSupply = token.totalSupply.plus(value);
  } else {
    let sender = getAccount(from, contract);
    let senderBalance = getERC1155Balance(sender.id, contract, tokenId);
    if (senderBalance) {
      senderBalance.value = senderBalance.value.minus(value);
      senderBalance.save();
    }
    erc1155Transfer.from = sender.id;
    erc1155Transfer.fromBalance = senderBalance.id;
  }
  erc1155Transfer.save();
}

export function handleApproval(event: Approval): void {
  let erc20PriceOracleVault = Erc20PriceOracleVault.load(event.address.toHex());
  if (erc20PriceOracleVault) {
    let erc20Approval = new ERC20Approval(event.transaction.hash.toHex());
    erc20Approval.owner = getAccount(
      event.params.owner.toHex(),
      event.address.toHex()
    ).id;
    erc20Approval.spender = getAccount(
      event.params.spender.toHex(),
      event.address.toHex()
    ).id;
    erc20Approval.valueExact = event.params.value;
    erc20Approval.value = toDecimals(
      event.params.value,
      erc20PriceOracleVault.decimals
    );
    erc20Approval.save();
  }
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let erc20PriceOracleVault = Erc20PriceOracleVault.load(event.address.toHex());
  let erc1155Contract = getERC1155Contract(event.address.toHex());
  if (erc20PriceOracleVault && erc1155Contract) {
    let erc1155ApprovalForAll = new ERC1155Approval(
      event.transaction.hash.toHex()
    );
    erc1155ApprovalForAll.contract = erc1155Contract.id;
    erc1155ApprovalForAll.spender = getAccount(
      event.params.operator.toHex(),
      event.address.toHex()
    ).id;
    erc1155ApprovalForAll.owner = getAccount(
      event.params.account.toHex(),
      event.address.toHex()
    ).id;
    erc1155ApprovalForAll.save();
  }
}

export function handleConstruction(
  event: ERC20PriceOracleVaultConstruction
): void {
  let erc20Contract = Contract.bind(event.address);
  let erc20PriceOracleVault = Erc20PriceOracleVault.load(event.address.toHex());
  if (erc20PriceOracleVault) {
    erc20PriceOracleVault.priceOracle = event.params.config.priceOracle.toHex();
    erc20PriceOracleVault.name = event.params.config.receiptVaultConfig.name;
    erc20PriceOracleVault.symbol =
      event.params.config.receiptVaultConfig.symbol;
    erc20PriceOracleVault.totalSupply = erc20Contract.totalSupply();
    erc20PriceOracleVault.decimals = erc20Contract.decimals();
    erc20PriceOracleVault.save();
  }
}

export function handleDeposit(event: DepositEvent): void {
  let deposit = new Deposit(event.transaction.hash.toHex());
  deposit.assets = event.params.assets;
  deposit.shares = event.params.shares;
  deposit.caller = getAccount(
    event.params.caller.toHex(),
    event.address.toHex()
  ).id;
  deposit.owner = getAccount(
    event.params.owner.toHex(),
    event.address.toHex()
  ).id;
  deposit.save();
}

export function handleTransfer(event: Transfer): void {
  let erc20PriceOracleVault = Erc20PriceOracleVault.load(event.address.toHex());
  if (erc20PriceOracleVault) {
    if (event.params.from == ZERO_ADDRESS) {
      erc20PriceOracleVault.totalSupply =
        erc20PriceOracleVault.totalSupply.plus(event.params.value);
    } else {
      let senderBalance = getERC20Balance(
        event.params.from.toHex(),
        erc20PriceOracleVault.id
      );
      senderBalance.valueExact = senderBalance.valueExact.minus(
        event.params.value
      );
      senderBalance.value = senderBalance.value = toDecimals(
        senderBalance.valueExact,
        erc20PriceOracleVault.decimals
      );
      senderBalance.save();
    }

    if (event.params.to == ZERO_ADDRESS) {
      erc20PriceOracleVault.totalSupply =
        erc20PriceOracleVault.totalSupply.minus(event.params.value);
    } else {
      let receiverBalance = getERC20Balance(
        event.params.to.toHex(),
        erc20PriceOracleVault.id
      );
      receiverBalance.valueExact = receiverBalance.valueExact.plus(
        event.params.value
      );
      receiverBalance.value = receiverBalance.value = toDecimals(
        receiverBalance.valueExact,
        erc20PriceOracleVault.decimals
      );
      receiverBalance.save();
    }

    let erc20Transfer = new ERC20Transfer(event.transaction.hash.toHex());
    erc20Transfer.timestamp = event.block.timestamp;
    erc20Transfer.contract = erc20PriceOracleVault.id;
    erc20Transfer.to = getAccount(
      event.params.to.toHex(),
      erc20PriceOracleVault.id
    ).id;
    erc20Transfer.from = getAccount(
      event.params.to.toHex(),
      erc20PriceOracleVault.id
    ).id;
    erc20Transfer.valueExact = event.params.value;
    erc20Transfer.value = toDecimals(
      event.params.value,
      erc20PriceOracleVault.decimals
    );
    erc20Transfer.transaction = getTransaction(
      event.block,
      event.transaction.hash.toHex()
    ).id;
    erc20PriceOracleVault.save();
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  updateERC1155Balance(
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.operator.toHex(),
    event.params.id,
    event.params.value,
    event.address.toHex(),
    getTransaction(event.block, event.transaction.hash.toHex())
  );
}

export function handleTransferBatch(event: TransferBatch): void {
  let ids = event.params.ids;
  let values = event.params.values;
  let transaction = getTransaction(event.block, event.transaction.hash.toHex());
  for (let i = 0; i < ids.length; ++i) {
    updateERC1155Balance(
      event.params.from.toHex(),
      event.params.to.toHex(),
      event.params.operator.toHex(),
      ids[i],
      values[i],
      event.address.toHex(),
      transaction
    );
  }
}

export function handleURI(event: URI): void {
}

export function handleWithdraw(event: WithdrawEvent): void {
  let withdraw = new Withdraw(event.transaction.hash.toHex());
  withdraw.assets = event.params.assets;
  withdraw.caller = getAccount(event.params.caller.toHex(), event.address.toHex()).id;
  withdraw.owner = getAccount(event.params.owner.toHex(), event.address.toHex()).id;
  withdraw.receiver = getAccount(event.params.receiver.toHex(), event.address.toHex()).id;
  withdraw.shares = event.params.shares;
  withdraw.save();
}
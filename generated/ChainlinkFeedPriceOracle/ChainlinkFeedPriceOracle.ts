// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Construction extends ethereum.Event {
  get params(): Construction__Params {
    return new Construction__Params(this);
  }
}

export class Construction__Params {
  _event: Construction;

  constructor(event: Construction) {
    this._event = event;
  }

  get sender(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get feed(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class ChainlinkFeedPriceOracle extends ethereum.SmartContract {
  static bind(address: Address): ChainlinkFeedPriceOracle {
    return new ChainlinkFeedPriceOracle("ChainlinkFeedPriceOracle", address);
  }

  price(): BigInt {
    let result = super.call("price", "price():(uint256)", []);

    return result[0].toBigInt();
  }

  try_price(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("price", "price():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get feed_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}
import { Address, dataSource, ethereum } from '@graphprotocol/graph-ts';
import { TwoPriceOracle, TwoPriceOracleFactory } from '../generated/schema';
import { TwoPriceOracleTemplate } from '../generated/templates';
import { NewChild } from '../generated/TwoPriceOracleFactory/TwoPriceOracleFactory';
import { ONE_BI, ZERO_BI } from './utils';
import { TwoPriceOracle as TwoPriceOracleContract } from '../generated/templates/TwoPriceOracleTemplate/TwoPriceOracle';

export function handleNewChild(event: NewChild): void {
    let factory = TwoPriceOracleFactory.load(event.address.toHex());
    if(!factory){
        factory = new TwoPriceOracleFactory(event.address.toHex());
        factory.childrenCount = ZERO_BI;
        factory.address = event.address;
        factory.children = [];
        factory.save();
    }
    if(factory){
        let twoPriceOracle = new TwoPriceOracle(event.params.child.toHex());
        twoPriceOracle.factory = factory.id;
        twoPriceOracle.deployBlock = event.block.number;
        twoPriceOracle.save();

        let children = factory.children;
        if(children)children.push(twoPriceOracle.id);
        factory.children = children;
        factory.childrenCount = factory.childrenCount.plus(ONE_BI);
        factory.save();
    }
    TwoPriceOracleTemplate.create(event.params.child);
}

export function handleBlock(block: ethereum.Block): void {
    let factory = TwoPriceOracleFactory.load(dataSource.address().toHex());
    if(factory){
        let children = factory.children;
        if(children){
            for(let i=0;i<children.length;i++){
                let contract = TwoPriceOracleContract.bind(Address.fromString(children[i]));
                let twoPriceOracle = TwoPriceOracle.load(children[i]);
                if(twoPriceOracle){
                    twoPriceOracle.value = contract.price();
                    twoPriceOracle.save()
                }
            }
        }
    }
}
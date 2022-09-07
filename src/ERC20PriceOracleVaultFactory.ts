import { NewChild } from '../generated/Erc20PriceOracleVaultFactory/Erc20PriceOracleVaultFactory';
import { ERC1155Contract, Erc20PriceOracleVault, Erc20PriceOracleVaultFactory } from '../generated/schema';
import { ONE_BI, ZERO_BI } from './utils';
import { Erc20PriceOracleVaultTemplate } from '../generated/templates';
export function handleNewChild(event: NewChild): void {
    let factory = Erc20PriceOracleVaultFactory.load(event.address.toHex());
    if(!factory){
        factory = new Erc20PriceOracleVaultFactory(event.address.toHex());
        factory.childrenCount = ZERO_BI;
        factory.address = event.address;
        factory.save();
    }

    if(factory){
        let erc20PriceOracleVault = new Erc20PriceOracleVault(event.params.child.toHex());
        erc20PriceOracleVault.erc20PriceOracleVaultFactory = factory.id;
        erc20PriceOracleVault.deployBlock = event.block.number;
        erc20PriceOracleVault.totalSupply = ZERO_BI;
        erc20PriceOracleVault.save();

        factory.childrenCount = factory.childrenCount.plus(ONE_BI);
        factory.save();

        let erc1155 = new ERC1155Contract(event.params.child.toHex())
        erc1155.address = event.params.child;
        erc1155.save();
    }
    Erc20PriceOracleVaultTemplate.create(event.params.child);
}
<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@thirdweb-dev/sdk](./sdk.md) &gt; [ContractDeployer](./sdk.contractdeployer.md) &gt; [deployMarketplace](./sdk.contractdeployer.deploymarketplace.md)

## ContractDeployer.deployMarketplace() method

Deploys a new Marketplace contract

<b>Signature:</b>

```typescript
deployMarketplace(metadata: z.input<typeof Marketplace.schema.deploy>): Promise<string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  metadata | z.input&lt;typeof Marketplace.schema.deploy&gt; | the contract metadata |

<b>Returns:</b>

Promise&lt;string&gt;

the address of the deployed contract


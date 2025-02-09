<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@thirdweb-dev/sdk](./sdk.md) &gt; [Erc20](./sdk.erc20.md) &gt; [transfer](./sdk.erc20.transfer.md)

## Erc20.transfer() method

Transfer Tokens

<b>Signature:</b>

```typescript
transfer(to: string, amount: BigNumberish): Promise<TransactionResult>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  to | string |  |
|  amount | BigNumberish |  |

<b>Returns:</b>

Promise&lt;[TransactionResult](./sdk.transactionresult.md)<!-- -->&gt;

## Remarks

Transfer tokens from the connected wallet to another wallet.

## Example


```javascript
// Address of the wallet you want to send the tokens to
const toAddress = "0x...";

// The amount of tokens you want to send
const amount = 0;

await contract.transfer(toAddress, amount);
```


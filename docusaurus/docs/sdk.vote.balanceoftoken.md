---
slug: /sdk.vote.balanceoftoken
title: Vote.balanceOfToken() method
hide_title: true
---
<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[@thirdweb-dev/sdk](./sdk.md) &gt; [Vote](./sdk.vote.md) &gt; [balanceOfToken](./sdk.vote.balanceoftoken.md)

## Vote.balanceOfToken() method

Check the balance of the project wallet in a particular ERC20 token contract

**Signature:**

```typescript
balanceOfToken(tokenAddress: string): Promise<CurrencyValue>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  tokenAddress | string |  |

**Returns:**

Promise&lt;[CurrencyValue](./sdk.currencyvalue.md)&gt;

- The balance of the project in the native token of the chain

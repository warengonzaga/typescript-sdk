---
slug: /sdk.vote.hasvoted
title: Vote.hasVoted() method
hide_title: true
---
<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[@thirdweb-dev/sdk](./sdk.md) &gt; [Vote](./sdk.vote.md) &gt; [hasVoted](./sdk.vote.hasvoted.md)

## Vote.hasVoted() method

Check If Wallet Voted

**Signature:**

```typescript
hasVoted(proposalId: string, account?: string): Promise<boolean>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  proposalId | string | The unique identifier of a proposal . |
|  account | string | (optional) wallet account address. Defaults to connected signer. |

**Returns:**

Promise&lt;boolean&gt;

- True if the account has already voted on the proposal.

## Remarks

Check if a specified wallet has voted a specific proposal

## Example


```javascript
// The proposal ID of the proposal you want to check
const proposalId = "0";
// The address of the wallet you want to check to see if they voted
const address = "{{wallet_address}}";

await contract.hasVoted(proposalId, address);
```

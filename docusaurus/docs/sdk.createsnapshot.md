---
slug: /sdk.createsnapshot
title: createSnapshot() function
hide_title: true
---
<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[@thirdweb-dev/sdk](./sdk.md) &gt; [createSnapshot](./sdk.createsnapshot.md)

## createSnapshot() function

Create a snapshot (merkle tree) from a list of addresses and uploads it to IPFS

<b>Signature:</b>

```typescript
declare function createSnapshot(leafs: string[], storage: IStorage): Promise<SnapshotInfo>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  leafs | string\[\] | the list of addresses to hash |
|  storage | IStorage |  |

<b>Returns:</b>

Promise&lt;SnapshotInfo&gt;

the generated snapshot and URI

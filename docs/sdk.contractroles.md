<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@thirdweb-dev/sdk](./sdk.md) &gt; [ContractRoles](./sdk.contractroles.md)

## ContractRoles class

Handles Contract roles and permissions

<b>Signature:</b>

```typescript
export declare class ContractRoles<TContract extends AccessControlEnumerable, TRole extends Role> 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(contractWrapper, roles)](./sdk.contractroles._constructor_.md) |  | Constructs a new instance of the <code>ContractRoles</code> class |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [get(role)](./sdk.contractroles.get.md) |  | Call this to get a list of addresses that are members of a specific role. |
|  [getAll()](./sdk.contractroles.getall.md) |  | Call this to get get a list of addresses for all supported roles on the contract. |
|  [grant(role, address)](./sdk.contractroles.grant.md) |  | Call this to grant a role to a specific address. |
|  [revoke(role, address)](./sdk.contractroles.revoke.md) |  | Call this to revoke a role from a specific address. |
|  [setAll(rolesWithAddresses)](./sdk.contractroles.setall.md) |  | Call this to OVERWRITE the list of addresses that are members of specific roles.<!-- -->Every role in the list will be overwritten with the new list of addresses provided with them. If you want to add or remove addresses for a single address use [ContractRoles.grant()](./sdk.contractroles.grant.md) and [ContractRoles.revoke()](./sdk.contractroles.revoke.md) respectively instead. |


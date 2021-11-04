import {
  Coin as Token,
  DataStore,
  Forwarder__factory,
  LazyNFT as Drop,
  Market,
  NFT,
  NFTCollection as Collection,
  Pack,
  ProtocolControl as App,
} from "@3rdweb/contracts";
import {
  JsonRpcSigner,
  Log,
  Provider,
  TransactionReceipt,
} from "@ethersproject/providers";
import { BaseContract, BigNumber, CallOverrides, ethers, Signer } from "ethers";
import type { ISDKOptions } from ".";
import { getContractMetadata, isContract } from "../common/contract";
import { ForwardRequest, getAndIncrementNonce } from "../common/forwarder";
import { getGasPriceForChain } from "../common/gas-price";
import { invariant } from "../common/invariant";
import { uploadMetadata } from "../common/ipfs";
import { ModuleType } from "../common/module-type";
import { getRoleHash, Role } from "../common/role";
import type { ModuleMetadata } from "../modules/app";
import type { MetadataURIOrObject, ProviderOrSigner } from "./types";

type PossibleContract =
  | App
  | Collection
  | DataStore
  | Drop
  | Market
  | NFT
  | Pack
  | Token;

/**
 * The root Module class. All other Modules extend this.
 * It should never be instantiated directly.
 * @public
 */
export class Module {
  /**
   * @readonly
   */
  public readonly address: string;
  /**
   * @internal
   * @readonly
   */
  protected readonly ipfsGatewayUrl: string;
  /**
   * @internal
   * @readonly
   */
  protected readonly options: ISDKOptions;

  /**
   * @internal
   */
  private _providerOrSigner: ProviderOrSigner | null = null;
  /**
   * @internal
   */
  protected get providerOrSigner(): ProviderOrSigner {
    return this.signer || this._providerOrSigner || this.getProviderOrSigner();
  }

  private set providerOrSigner(value: ProviderOrSigner) {
    this._providerOrSigner = value;
  }

  /**
   * @internal
   */
  private _signer: Signer | null = null;
  /**
   * @internal
   */
  protected get signer(): Signer | null {
    return this._signer;
  }

  private set signer(value: Signer | null) {
    this._signer = value;
  }

  /**
   * @internal
   */
  constructor(
    providerOrSigner: ProviderOrSigner,
    address: string,
    options: ISDKOptions,
  ) {
    this.address = address;
    this.options = options;
    this.ipfsGatewayUrl = options.ipfsGatewayUrl;
    this.setProviderOrSigner(providerOrSigner);
  }

  /**
   * @internal
   */
  public setProviderOrSigner(providerOrSigner: ProviderOrSigner) {
    this.providerOrSigner = providerOrSigner;
    if (Signer.isSigner(providerOrSigner)) {
      this.signer = providerOrSigner;
    }
    this.connectContract();
  }

  /**
   * @internal
   */
  public clearSigner(): void {
    this.signer = null;
  }

  /**
   * @internal
   */
  private getProviderOrSigner(): ProviderOrSigner {
    return this.signer || this.providerOrSigner;
  }

  /**
   * @internal
   */
  protected getSigner(): Signer | null {
    if (Signer.isSigner(this.signer)) {
      return this.signer;
    }
    return null;
  }

  /**
   * @internal
   */
  protected hasValidSigner(): boolean {
    return Signer.isSigner(this.signer);
  }

  /**
   * @internal
   */
  protected async getSignerAddress(): Promise<string> {
    const signer = this.getSigner();
    invariant(signer, "Cannot get signer address without valid signer");
    return await signer.getAddress();
  }

  /**
   * @internal
   */
  protected async getProvider(): Promise<Provider | undefined> {
    const provider: Provider | undefined = Signer.isSigner(
      this.getProviderOrSigner(),
    )
      ? (this.providerOrSigner as Signer).provider
      : (this.providerOrSigner as Provider);
    return provider;
  }

  /**
   * @internal
   */
  protected async getChainID(): Promise<number> {
    const provider = await this.getProvider();
    invariant(provider, "getChainID() -- No Provider");
    const { chainId } = await provider.getNetwork();
    return chainId;
  }

  /**
   * @override
   * @internal
   */
  protected connectContract(): BaseContract {
    throw new Error("connectContract has to be implemented");
  }

  /**
   * @override
   * @internal
   */
  protected getModuleType(): ModuleType {
    throw new Error("getModuleType has to be implemented");
  }

  /**
   * @internal
   */
  protected async getCallOverrides(): Promise<CallOverrides> {
    const chainId = await this.getChainID();
    const speed = this.options.gasSpeed;
    const maxGasPrice = this.options.maxGasPriceInGwei;
    const gasPriceChain = await getGasPriceForChain(
      chainId,
      speed,
      maxGasPrice,
    );
    if (!gasPriceChain) {
      return {};
    }
    // TODO: support EIP-1559 by try-catch, provider.getFeeData();
    return {
      gasPrice: ethers.utils.parseUnits(gasPriceChain.toString(), "gwei"),
    };
  }

  /**
   * @public
   * @returns whether the given contract exists on-chain
   */
  public async exists(): Promise<boolean> {
    const provider = await this.getProvider();
    invariant(provider, "exists() -- No Provider");
    return isContract(provider, this.address);
  }

  /**
   * @public
   * Get the metadata of the contract.
   */
  public async getMetadata(): Promise<ModuleMetadata> {
    invariant(await this.exists(), "contract does not exist");
    const contract = this.connectContract();
    const type = this.getModuleType();

    return {
      metadata: await getContractMetadata(
        this.getProviderOrSigner(),
        contract.address,
        this.options.ipfsGatewayUrl,
      ),
      address: contract.address,
      type,
    };
  }

  /**
   * @public
   * Set new metadata on the contract and return it if successful.
   * @param metadata - The metadata to set.
   */
  public async setMetadata(
    metadata: MetadataURIOrObject,
  ): Promise<ModuleMetadata> {
    invariant(await this.exists(), "contract does not exist");
    const uri = await uploadMetadata(metadata);
    await this.sendTransaction("setContractURI", [uri]);
    return this.getMetadata();
  }

  /**
   * @internal
   */
  protected async sendTransaction(
    fn: string,
    args: any[],
    callOverrides?: CallOverrides,
  ): Promise<TransactionReceipt> {
    if (!callOverrides) {
      callOverrides = await this.getCallOverrides();
    }
    if (this.options.transactionRelayerUrl) {
      return await this.sendGaslessTransaction(fn, args, callOverrides);
    } else {
      return await this.sendAndWaitForTransaction(fn, args, callOverrides);
    }
  }

  /**
   * @internal
   */
  private async sendAndWaitForTransaction(
    fn: string,
    args: any[],
    callOverrides: CallOverrides,
  ): Promise<TransactionReceipt> {
    const contract = this.connectContract();
    const tx = await contract.functions[fn](...args, callOverrides);
    if (tx.wait) {
      return await tx.wait();
    }
    return tx;
  }

  /**
   * @internal
   */
  private async sendGaslessTransaction(
    fn: string,
    args: any[],
    callOverrides: CallOverrides,
  ): Promise<TransactionReceipt> {
    console.log("callOverrides", callOverrides);
    const signer = this.getSigner();
    invariant(
      signer,
      "Cannot execute gasless transaction without valid signer",
    );
    const provider = await this.getProvider();
    invariant(provider, "no provider to execute transaction");
    const chainId = await this.getChainID();
    const contract = this.connectContract();
    const from = await this.getSignerAddress();
    const to = this.address;
    const value = 0;
    const data = contract.interface.encodeFunctionData(fn, args);
    const gas = (await contract.estimateGas[fn](...args)).mul(2);
    const forwarderAddress = this.options.transactionRelayerForwarderAddress;
    const forwarder = Forwarder__factory.connect(
      forwarderAddress,
      this.getProviderOrSigner(),
    );
    const nonce = await getAndIncrementNonce(forwarder, from);

    const domain = {
      name: "GSNv2 Forwarder",
      version: "0.0.1",
      chainId,
      verifyingContract: forwarderAddress,
    };

    const types = {
      ForwardRequest,
    };

    const message = {
      from,
      to,
      value: BigNumber.from(value).toString(),
      gas: BigNumber.from(gas).toString(),
      nonce: BigNumber.from(nonce).toString(),
      data,
    };

    const signature = await (signer as JsonRpcSigner)._signTypedData(
      domain,
      types,
      message,
    );

    // await forwarder.verify(message, signature);
    const txHash = await this.options.transactionRelayerSendFunction(
      message,
      signature,
    );

    return await provider.waitForTransaction(txHash);
  }

  protected parseEventLogs(eventName: string, logs?: Log[]): any {
    if (!logs) {
      return null;
    }
    const contract = this.connectContract();
    for (const log of logs) {
      try {
        const event = contract.interface.decodeEventLog(
          eventName,
          log.data,
          log.topics,
        );
        return event;
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    return null;
  }
}

/**
 * Extends the {@link Module} class to add roles functionality.
 * It should never be instantiated directly.
 * @public
 */
export class ModuleWithRoles extends Module {
  /**
   * @override - needs to be overridden by subclasses
   * @internal
   */
  protected getModuleRoles(): Role[] {
    throw new Error("getModuleRoles has to be implemented by a subclass");
  }

  /**
   * @internal
   */
  public get roles() {
    return this.getModuleRoles();
  }

  public async getRoleMembers(role: Role): Promise<string[]> {
    invariant(
      this.roles.includes(role),
      `this module does not support the "${role}" role`,
    );
    const contract = this.connectContract() as PossibleContract;
    invariant(
      contract.getRoleMemberCount,
      "roles are not supported on this module",
    );
    const roleHash = getRoleHash(role);
    const count = (await contract.getRoleMemberCount(roleHash)).toNumber();
    return await Promise.all(
      Array.from(Array(count).keys()).map((i) =>
        contract.getRoleMember(roleHash, i),
      ),
    );
  }

  public async getAllRoleMembers(): Promise<Partial<Record<Role, string[]>>> {
    invariant(this.roles.length, "this module has no support for roles");
    const roles: Partial<Record<Role, string[]>> = {};
    for (const role of this.roles) {
      roles[role] = await this.getRoleMembers(role);
    }
    return roles;
  }

  public async grantRole(
    role: Role,
    address: string,
  ): Promise<TransactionReceipt> {
    invariant(
      this.roles.includes(role),
      `this module does not support the "${role}" role`,
    );
    return await this.sendTransaction("grantRole", [
      getRoleHash(role),
      address,
    ]);
  }

  public async revokeRole(
    role: Role,
    address: string,
  ): Promise<TransactionReceipt> {
    invariant(
      this.roles.includes(role),
      `this module does not support the "${role}" role`,
    );
    const signerAddress = await this.getSignerAddress();
    if (signerAddress.toLowerCase() === address.toLowerCase()) {
      return await this.sendTransaction("renounceRole", [
        getRoleHash(role),
        address,
      ]);
    } else {
      return await this.sendTransaction("revokeRole", [
        getRoleHash(role),
        address,
      ]);
    }
  }
}

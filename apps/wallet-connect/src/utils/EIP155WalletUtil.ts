// Assuming KeepKey's functionalities are encapsulated in the provided methods
class EIP155Lib {
  wallet: any;
  constructor(wallet: any) {
    this.wallet = wallet.keepkey;
  }

  async getMnemonic() {
    // Implement if KeepKey allows extracting mnemonic, which is unlikely due to security reasons
    return "lol, no";
  }

  async getPrivateKey() {
    // This is also highly sensitive and usually not directly accessible
    return "lol, no";
  }

  async getAddress() {
    console.log("keepkey: ",this.wallet)
    console.log("this.wallet.ETH: ",this.wallet.ETH)
    console.log("this.wallet.ETH: ",this.wallet.ETH.wallet)
    console.log("this.wallet.ETH.wallet.address: ",this.wallet.ETH.wallet.address)
    // Use KeepKey's method to get the wallet address
    return this.wallet.ETH.wallet.address;
  }

  async signMessage(message: any) {
    console.log("signMessage: ", message)
    // Use KeepKey's method to sign a message
    return this.wallet.ETH.walletMethods.signMessage(message);
  }

  async signTransaction(transaction: any) {
    console.log("transaction: ", transaction)
    console.log("walletMethods: ", this.wallet.ETH.walletMethods)
    // Use KeepKey's method to sign a transaction
    return this.wallet.ETH.walletMethods.sendTransaction(transaction);
  }

  // Additional methods can be mapped here...
}

export let wallet1: EIP155Lib
// export let wallet2: EIP155Lib
export let eip155Wallets: Record<string, EIP155Lib>
export let eip155Addresses: string[]

export async function createOrRestoreEIP155Wallet(keepkey: any) {
  try {
    console.log("createOrRestoreEIP155Wallet keepkey: ", keepkey);
    const wallet = new EIP155Lib({ keepkey });
    wallet1 = wallet;

    // Assuming KeepKey can provide a list of addresses or a single address
    const address = await wallet.getAddress();
    console.log("address: ", address);

    eip155Wallets = {
      [address]: wallet,
    };
    eip155Addresses = Object.keys(eip155Wallets);

    return {
      eip155Wallets,
      eip155Addresses,
    };
  } catch (e) {
    // Handle any errors
    console.error("Failed to create or restore EIP155 wallet:", e);
    throw e; // It's generally a good practice to re-throw the error after logging it
  }
}

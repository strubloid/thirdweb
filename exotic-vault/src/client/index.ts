import { ThirdwebClient } from "./thirdweb";
import React, { useEffect, useState } from "react";

class ClientManager {
  client: any = null;
  wallets: any = null;
  thirdwebClient: ThirdwebClient;

  constructor() {
    this.thirdwebClient = new ThirdwebClient();
    this.client = this.thirdwebClient.getClient();
  }

  async startWallets() {
    if (!this.wallets) {
      this.wallets = await this.thirdwebClient.getWallets();
    }
    return this.wallets;
  }

  getWallets() {
    return this.wallets;
  }

  getClient() {
    return this.client;
  }

  // Empty function to be triggered by button
  async realoadWallets() {
    this.wallets = null;
    return await this.getWallets();
  }

  // Clean all wallets function
  async cleanAllWallets() {
    await this.thirdwebClient.cleanAllWalletsFromEngine();
    this.wallets = this.thirdwebClient.wallets;
  }

  // Load specific wallet function
  loadSpecificWallet() {
    console.log("Load specific wallet - empty function");
  }

}

// === Exported Client Instance ===
// Single instance for the entire application
export const client = new ClientManager();



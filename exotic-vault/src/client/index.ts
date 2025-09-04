import { ThirdwebClient } from "./thirdweb";
import React, { useEffect, useState } from "react";

class ClientManager {
    client: any = null;
    thirdwebClient: ThirdwebClient;

    serverWallet: any = null;
    inAppWallet: any = null;

    constructor() {
        this.thirdwebClient = new ThirdwebClient();
        this.client = this.thirdwebClient.getClient();
    }

    /**
     * Get the Thirdweb client instance.
     * @returns The Thirdweb client instance.
     */
    getClient() {
        return this.client;
    }

    /**
     * Get the server wallet instance.
     * @returns The server wallet instance.
     */
    async getServerWallet() {
        this.serverWallet = await this.thirdwebClient.getServerWallet();
        return this.serverWallet;
    }

    /**
     * Get the in-app wallet instance.
     * @returns The in-app wallet instance.
     */
    async getInAppWallet() {

        // loading the in-app wallet
        this.inAppWallet = await this.thirdwebClient.getInAppWallet();
        console.log('inAppWallet', this.inAppWallet);

        return this.inAppWallet;
    }

    // Clean inAppWallets function
    // TODO !!!!
    async cleanInAppWallet() {
        await this.thirdwebClient.cleanInAppWallet();
        this.inAppWallet = this.thirdwebClient.wallets;
    }

    // Clean all wallets function
    async addInAppWallet() {
        await this.thirdwebClient.addInAppWallet();
    }
}

// === Exported Client Instance ===
// Single instance for the entire application
export const client = new ClientManager();

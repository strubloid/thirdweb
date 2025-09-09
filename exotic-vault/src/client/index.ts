import { ThirdwebActions } from "./thirdweb";
import React, { useEffect, useState } from "react";

class ClientManager {
    client: any = null;
    thirdwebActions: ThirdwebActions;

    serverWallet: any = null;
    inAppWallet: any = null;

    constructor() {
        this.thirdwebActions = new ThirdwebActions();
        this.client = this.thirdwebActions.getClient();
    }

    /**
     * Get the Thirdweb client instance.
     * @returns The Thirdweb client instance.
     */
    getClient() {
        return this.client;
    }

    /**
     * Get all server wallets
     * @returns The server wallet instance.
     */
    async getServerWallets() {
        this.serverWallet = await this.thirdwebActions.getServerWallets();
        return this.serverWallet;
    }

    /**
     * Get the server wallet instance.
     * @returns The server wallet instance.
     */
    async getServerWallet() {
        this.serverWallet = await this.thirdwebActions.getServerWallet();
        return this.serverWallet;
    }

    /**
     * Get the in-app wallet instance.
     * @returns The in-app wallet instance.
     */
    async getInAppWallets() {
        // loading the in-app wallet
        this.inAppWallet = await this.thirdwebActions.getInAppWallets();
        return this.inAppWallet;
    }

    /**
     * This is the way to clean it up all wallets
     * this is more to be used at test environment.
     */
    async cleanInAppWallet() {
        await this.thirdwebActions.removeAllInAppWallets();
        this.inAppWallet = this.thirdwebActions.wallets;
    }

    // Clean all wallets function
    async addInAppWallet() {
        await this.thirdwebActions.addInAppWallet();
    }

    // Transfer AVAX function
    async transferAVAX(
        toAddress: string,
        amount: string,
        useServerWallet: boolean = true,
        fromAddress: string = ""
    ) {
        // this.thirdwebActions.inintialize();
        return await this.thirdwebActions.transferAVAX(
            toAddress,
            amount,
            useServerWallet,
            fromAddress
        );
    }

    /**
     * Get the balance of the in-app wallet in Euros.
     * @returns The balance of the in-app wallet in Euros.
     */
    async getInAppBalance() {
        let balance = await this.thirdwebActions.getInAppBalance("EUR");
        console.log("balance in euros:");
        console.log(balance);
        return balance;
    }
}

// === Exported Client Instance ===
// Single instance for the entire application
export const client = new ClientManager();

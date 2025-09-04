import { createThirdwebClient, Engine } from "thirdweb";
import { THIRDWEB_CLIENT_ID, THIRDWEB_CLIENT_SECRET } from "../variables";

export class ThirdwebClient {
    clientId: string;
    clientSecret: string;
    client: any;
    wallets: any;

    constructor() {
        this.clientId = THIRDWEB_CLIENT_ID;
        this.clientSecret = THIRDWEB_CLIENT_SECRET;
    }

    getClient() {
        if (!this.client) {
            this.client = createThirdwebClient({
                clientId: this.clientId,
                secretKey: this.clientSecret,
            });
        }
        return this.client;
    }

    async getWallets() {
        if (!this.wallets) {
            this.wallets = await Engine.getServerWallets({
                client: this.getClient(),
            });
        }
        return this.wallets;
    }

    // cleanWallets() {
    //     this.wallets = null;
    //     console.log("Wallets cleaned from cache");
    // }

    async cleanAllWalletsFromEngine() {
        try {
            // Get all server wallets first
            const { Engine } = await import("thirdweb");
            const walletsResponse = await Engine.getServerWallets({
                client: this.getClient(),
            });
            
            // If there are wallets, delete each one using the correct API
            if (walletsResponse?.accounts && walletsResponse.accounts.length > 0) {
                for (const wallet of walletsResponse.accounts) {
                    try {
                        // Use direct fetch to Engine API for deletion
                        // Based on useEngineDeleteBackendWallet from thirdweb dashboard
                        const response = await fetch(
                            `https://engine.thirdweb.com/backend-wallet/${wallet.address}`,
                            {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "x-secret-key": this.clientSecret,
                                },
                            }
                        );
                        
                        const result = await response.json();
                        
                        if (result.error) {
                            console.error(`Failed to delete wallet ${wallet.address}:`, result.error);
                        } else {
                            console.log(`Successfully deleted wallet: ${wallet.address}`);
                        }
                    } catch (walletError) {
                        console.error(`Error deleting wallet ${wallet.address}:`, walletError);
                    }
                }
            }
            
            // Clear local cache after deletion attempts
            this.wallets = null;
            console.log("All wallets deletion completed and cache cleared");
            return true;
        } catch (error) {
            console.error("Error cleaning wallets from Engine:", error);
            // Still clear cache even if deletion failed
            this.wallets = null;
            return false;
        }
    }
}

import { createThirdwebClient, Engine } from "thirdweb";
import { getProfiles, inAppWallet } from "thirdweb/wallets";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { unlinkProfile } from "thirdweb/wallets/in-app";
import { THIRDWEB_CLIENT_ID, THIRDWEB_CLIENT_SECRET } from "../variables";

export class ThirdwebClient {
    clientId: string;
    clientSecret: string;
    client: any | null = null;
    chain: any;
    developerMode: boolean = true;
    wallets: any | null = null;
    jwtToken: string | null = null;

    constructor() {
        this.clientId = THIRDWEB_CLIENT_ID;
        this.clientSecret = THIRDWEB_CLIENT_SECRET;

        // loading the chain based on the developer mode
        this.chain = this.developerMode ? avalancheFuji : avalanche;
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

            let clientWallet = this.getClient();

            console.log("Fetching", clientWallet);

            this.wallets = await Engine.getServerWallets({
                client: clientWallet,
            });

            console.log(this.wallets)
        }
        return this.wallets;
    }

    async addTestWallet() {
        try {
            console.log("Starting Add Wallets");

            // generate the inAppWallet
            const wallet = inAppWallet({
                auth: {
                    options: ["backend" , "email"],
                },
                metadata: {
                    name: "rafael.mendes@example.com",
                },
                executionMode: {
                    mode: "EIP4337",
                    smartAccount: {
                        chain: this.chain,
                        sponsorGas: true,
                    },
                },
            });

            this.jwtToken = "1234";

            // Try to connect with JWT backend authentication
            // const account = await wallet.connect({
            //     client: this.client,
            //     strategy: "backend",
            //     walletSecret: this.jwtToken,
            // });

            

            const account = await wallet.connect({
                client: this.client,
                strategy: "backend",
                walletSecret: this.jwtToken,
            });

            console.log("Connected account:", account);
        } catch (authError) {
            console.error("❌ Backend authentication failed:", authError);
        }
    }

    async cleanAllWalletsFromEngine() {
        try {
            console.log("Starting to clean all wallets from Engine...");
            // Get all server wallets first
            const walletsResponse = await this.getWallets();

            // If there are wallets, delete each one using the profile unlinking approach
            if (
                walletsResponse?.accounts &&
                walletsResponse.accounts.length > 0
            ) {
                for (const wallet of walletsResponse.accounts) {
                    try {
                        await this.deleteWalletUser(wallet.address);
                    } catch (walletError) {
                        console.error(
                            `❌ Error deleting wallet ${wallet.address}:`,
                            walletError
                        );
                    }
                }
            } else {
                console.log("No wallets found to delete");
            }

            // Clear local cache after deletion attempts
            this.wallets = null;
            return true;
        } catch (error) {
            console.error("Error cleaning wallets from Engine:", error);
            // Still clear cache even if deletion failed
            this.wallets = null;
            return false;
        }
    }

    async deleteWalletUser(address: string) {
        try {
            console.log(`🔍 Getting profiles: ${address}`);

            // 1) Get all profiles for this wallet address
            const walletProfiles = await getProfiles({
                client: this.getClient(),
            });

            console.log(`Found: ${walletProfiles.length}`);

            if (walletProfiles.length === 0) {
                console.log(`No profiles found... [${address}]`);
                return false;
            }

            // 2) Unlink all profiles; pass allowAccountDeletion on the last one
            for (let i = 0; i < walletProfiles.length; i++) {
                let walletProfile = walletProfiles[i];

                console.log(`Unlinking profile`);
                console.log(walletProfile);

                await unlinkProfile({
                    client: this.getClient(),
                    profileToUnlink: walletProfile,
                    allowAccountDeletion: true,
                });
            }

            console.log(`✅ Successfully deleted wallet ${address}`);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting wallet: ${address}:`, error);
            throw error;
        }
    }
}

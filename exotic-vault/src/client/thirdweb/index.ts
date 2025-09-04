import { createThirdwebClient, Engine } from "thirdweb";
import { getProfiles, inAppWallet } from "thirdweb/wallets";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { unlinkProfile } from "thirdweb/wallets/in-app";
import { THIRDWEB_CLIENT_ID, THIRDWEB_CLIENT_SECRET } from "../variables";

type ThirdwebUserProfile =
    | { type: "email"; email: string; emailVerified?: boolean }
    | { type: "phone"; phone: string }
    | { type: string; [k: string]: unknown };

export type ThirdwebUser = {
    address: string;
    smartWalletAddress?: string | null;
    createdAt: string;
    profiles: ThirdwebUserProfile[];
};

export class ThirdwebClient {
    clientId: string;
    clientSecret: string;
    client: any | null = null;
    profiles: any | null = null;
    chain: any;
    developerMode: boolean = true;
    wallets: any | null = null;

    userInAppWallet: any | null = null;
    serverWallet: any | null = null;
    jwtToken: string = null;

    constructor() {
        this.clientId = THIRDWEB_CLIENT_ID;
        this.clientSecret = THIRDWEB_CLIENT_SECRET;

        // loading the chain based on the developer mode
        this.chain = this.developerMode ? avalancheFuji : avalanche;

        // FIXME: at the app, change for the request token
        this.jwtToken = "1234";

        // loading the client
        this.client = createThirdwebClient({
            clientId: this.clientId,
            secretKey: this.clientSecret,
        });
    }

    getClient() {
        return this.client;
    }

    /**
     * Loading the server wallet
     */
    async getServerWallet() {
        if (!this.serverWallet) {
            this.serverWallet = await Engine.getServerWallets({
                client: this.client,
            });
        }
        return this.serverWallet;
    }

    /**
     * Loading the in-app wallet
     * @returns
     */
    async getInAppWallet(opts?: {
        pageSize?: number;
        maxPages?: number;
        filters?: Partial<{
            address: string;
            email: string;
            phone: string;
            externalWalletAddress: string;
            id: string;
        }>;
    }) {
        if (!this.userInAppWallet) {

            const base = "https://api.thirdweb.com/v1/wallets/user";
            const limit = Math.min(Math.max(opts?.pageSize ?? 100, 1), 100);
            let page = 1;
            let pagesFetched = 0;
            const all: ThirdwebUser[] = [];
            
            for (;;) {
                const qs = new URLSearchParams({
                    limit: String(limit),
                    page: String(page),
                });
                if (opts?.filters) {
                    for (const [k, v] of Object.entries(opts.filters)) {
                        if (v) qs.set(k, String(v));
                    }
                }

                const res = await fetch(`${base}?${qs.toString()}`, {
                    method: "GET",
                    headers: { "x-secret-key": this.clientSecret },
                });

                // console.log('response', res);

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(
                        `thirdweb /wallets/user ${res.status}: ${text}`
                    );
                }

                const json = (await res.json()) as {
                    result?: {
                        wallets?: ThirdwebUser[];
                        pagination?: { hasMore?: boolean };
                    };
                };

                const wallets = json.result?.wallets ?? [];
                all.push(...wallets);

                pagesFetched++;
                const hasMore = Boolean(json.result?.pagination?.hasMore);
                if (!hasMore) break;
                if (opts?.maxPages && pagesFetched >= opts.maxPages) break;

                page++;
            }
            
            // If exist something we will add to it
            if (all.length > 0) {
                this.userInAppWallet = all;
            }
            
        }
        return this.userInAppWallet;
    }

    // FIXME!!!!!
    async getWallets() {
        // getting all profiles
        this.profiles = await getProfiles({
            client: this.client,
        });
        if (!this.serverWallet) {
            this.serverWallet = await Engine.getServerWallets({
                client: this.client,
            });
        }

        if (!this.wallets) {
            console.log("Fetching in-app wallets", this.client);

            this.wallets = await getProfiles({
                client: this.getClient(),
            });

            this.wallets = [];

            console.log(this.wallets);
        }
        return this.wallets;
    }

    // FIXME
    async cleanInAppWallet() {
        try {
            // TODO: implement the clean in-app wallets function

            console.log("clean all in-app wallets");
            // Get all in-app wallets first
            // const walletsResponse = await this.getInAppWallets();

            // // If there are wallets, delete each one using the profile unlinking approach
            // if (
            //     walletsResponse?.accounts &&
            //     walletsResponse.accounts.length > 0
            // ) {
            //     for (const wallet of walletsResponse.accounts) {
            //         try {
            //             await this.deleteWalletUser(wallet.address);
            //         } catch (walletError) {
            //             console.error(
            //                 `❌ Error deleting wallet ${wallet.address}:`,
            //                 walletError
            //             );
            //         }
            //     }
            // } else {
            //     console.log("No wallets found to delete");
            // }

            // // Clear local cache after deletion attempts
            // this.wallets = null;
            return true;
        } catch (error) {
            console.error("Error cleaning wallets from Engine:", error);
            // Still clear cache even if deletion failed
            this.wallets = null;
            return false;
        }
    }
    // FIXME
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

    async addInAppWallet() {
        try {
            console.log("ADDING IN APP WALLET");

            // generate the inAppWallet
            const inAppWalletObject = inAppWallet({
                auth: {
                    options: ["backend"],
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

            // FIXME later
            this.jwtToken = this.jwtToken ? this.jwtToken : "1234";

            // Try to connect with JWT backend authentication
            const account = await inAppWalletObject.connect({
                client: this.client,
                strategy: "backend",
                walletSecret: this.jwtToken,
            });

            console.log(" New IN APP WALLET:", account);

        } catch (authError) {
            console.error("❌ Backend authentication failed:", authError);
        }
    }
}

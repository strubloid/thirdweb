import { createThirdwebClient, Engine, getUser, NATIVE_TOKEN_ADDRESS, prepareTransaction, sendAndConfirmTransaction, toWei } from "thirdweb";
import { getProfiles, inAppWallet, getWalletBalance, Account, privateKeyToAccount } from "thirdweb/wallets";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { unlinkProfile } from "thirdweb/wallets/in-app";
import { THIRDWEB_CHAIN, THIRDWEB_CLIENT_ID, THIRDWEB_CLIENT_SECRET, THIRDWEB_SERVER_WALLET_ADDRESS } from "../variables";
import { convertCryptoToFiat } from "thirdweb/pay";

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
    serverWalletAddress: string;
    userInAppWallet: any | null = null;
    serverWallet: any | null = null;
    serverWallets: any[] | null = null;
    jwtToken: string;

    constructor() {

        this.clientId = THIRDWEB_CLIENT_ID;
        this.clientSecret = THIRDWEB_CLIENT_SECRET;
        this.serverWalletAddress = THIRDWEB_SERVER_WALLET_ADDRESS;

        console.log(this.clientSecret)

        const serverAccount = privateKeyToAccount(this.clientSecret);


        // const serverAccount = privateKeyToAccount({
        //     client: this.client, 
        //     privateKey: this.clientSecret,
        // });
        console.log("Server Account: KKKKKKKKKKKKKKKKK ", serverAccount);

        // loading the chain based on the developer mode
        this.chain = this.developerMode || THIRDWEB_CHAIN == "avalanche-fuji" ? avalancheFuji : avalanche;

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
    async getServerWallets() {
        if (!this.serverWallets) {
            const response = await Engine.getServerWallets({
                client: this.client,
            });
            this.serverWallets = response.accounts;
        }
        return this.serverWallets;
    }

    /**
     * This will get the first server wallet of the collection
     * and return as the main wallet.
     * @returns wallet instance
     */
    /**
     * This will get an address server wallet and get the reference of it.
     * @param walletAddress loads this address.
     * @returns 
     */
    async getServerWallet(walletAddress: string = '') {

        this.serverWallet = await Engine.serverWallet({
            client: this.client,
            address: walletAddress
        });

        return this.serverWallet;
    }


    /**
     * Loading the in-app wallet
     * @returns
     */
    async getInAppWallets(opts?: {
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
            let hasMore = true;

            while (
                hasMore &&
                (!opts?.maxPages || pagesFetched < opts.maxPages)
            ) {
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
                page++;

                // Update hasMore for next iteration
                hasMore = Boolean(json.result?.pagination?.hasMore);
            }

            // If exist something we will add to it
            if (all.length > 0) {
                this.userInAppWallet = all;
            }
        }
        return this.userInAppWallet;
    }

    /**
     * This will get the in-app wallet, we will search for the
     * walletSecret (JWT token)
     * @param $jwtToken a JWT token to search for the in-app wallet
     * @returns an in-app wallet
     */
    async getInAppWallet($jwtToken: string) {
        // getting the client and the walletSecret
        let client = this.client;
        let walletSecret = $jwtToken;
        // let walletSecret = $jwtToken + "error";

        // starting the inAppWallet
        const wallet = inAppWallet();

        // Try to connect with JWT backend authentication
        const account = await wallet.connect({
            client,
            strategy: "backend",
            walletSecret,
        });

        // TODO: remove later
        console.log(" IN APP WALLET:", account);
        return account;
    }

    async getInAppBalance() {
        try {
            console.log("clean all in-app wallets");

            // loading the client
            const client = this.getClient();

            // loading the in-app wallet
            const userInAppWallet = await this.getInAppWallet(this.jwtToken);

            const address = userInAppWallet?.address;

            // loading the user data
            const user = await getUser({
                client,
                walletAddress: address,
            });

            // we are loading only one chain, but we can add any other one and will return all the balances
            let chains = [this.chain];

            // getting the balances for each chain
            const balances = await Promise.all(
                chains.map(async (chain) => {
                    console.log(chain);

                    const native = await getWalletBalance({
                        client,
                        address,
                        chain,
                        // tokenAddress: undefined  // native coin; set to an ERC-20 address to read a token
                    });
                    
                    // TODO: Double check this with real values
                    const { result: nativeEur } = await convertCryptoToFiat({
                        client,
                        chain,
                        fromTokenAddress: NATIVE_TOKEN_ADDRESS,
                        fromAmount: Number(native.value),
                        to: "EUR",
                    });

                    console.log("Native balance:", nativeEur);

                    return {
                        chainId: chain.id,
                        chainName: (chain as any).name ?? `${chain.id}`,
                        native: {
                            symbol: native.symbol,
                            value: native.value, // bigint in wei
                            eurValue: nativeEur, // EUR value of the native token balance
                            displayValue: native.displayValue, // human-readable
                            decimals: native.decimals,
                        },
                    };
                })
            );

            console.log("Get in app wallet balance");
            console.log(balances);

            return true;
        } catch (error) {
            console.error("Error :", error);
            return false;
        }
    }

    /**
     * This will clean one in-app wallets.
     * @returns
     */
    async cleanInAppWallet() {
        try {
            console.log("clean all in-app wallets");

            // // loading the client
            // const client = this.getClient();

            // // loading the in-app wallet
            // const userInAppWallet = await this.getInAppWallet(this.jwtToken);

            // const address = userInAppWallet?.address;

            // // loading the user data
            // const user = await getUser({
            //     client,
            //     walletAddress: address,
            // });

            // // we are loading only one chain, but we can add any other one and will return all the balances
            // let chains = [this.chain];

            // // getting the balances for each chain
            // const balances = await Promise.all(
            //     chains.map(async (chain) => {
            //         console.log(chain);

            //         const native = await getWalletBalance({
            //             client,
            //             address,
            //             chain,
            //             // tokenAddress: undefined  // native coin; set to an ERC-20 address to read a token
            //         });
                    
            //         // TODO: Double check this with real values
            //         const { result: nativeEur } = await convertCryptoToFiat({
            //             client,
            //             chain,
            //             fromTokenAddress: NATIVE_TOKEN_ADDRESS,
            //             fromAmount: Number(native.value),
            //             to: "EUR",
            //         });

            //         console.log("Native balance:", nativeEur);

            //         return {
            //             chainId: chain.id,
            //             chainName: (chain as any).name ?? `${chain.id}`,
            //             native: {
            //                 symbol: native.symbol,
            //                 value: native.value, // bigint in wei
            //                 eurValue: nativeEur, // EUR value of the native token balance
            //                 displayValue: native.displayValue, // human-readable
            //                 decimals: native.decimals,
            //             },
            //         };
            //     })
            // );

            // console.log(balances);

            // Get all in-app wallets first
            const walletsResponse = await this.getInAppWallets();

        
            // If there are wallets, delete each one using the profile unlinking approach
            if (walletsResponse && walletsResponse?.length > 0) {
                for (const wallet of walletsResponse) {
                    try {
                        await this.deleteWalletUser(wallet.address);
                    } catch (walletError) {
                        console.error(
                            `❌ Error deleting wallet ${wallet.address}:`,
                            walletError
                        );
                    }
                }
                console.log("delete");

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
    // FIXME
    async deleteWalletUser(address: string) {
        try {
            console.log(`🔍 Getting profiles: ${address}`);

            // 1) Get all profiles for this wallet address
            const walletProfiles = await getProfiles({
                client: this.getClient(),
            });

            console.log("walletProfiles");
            console.log(walletProfiles);
            console.log(walletProfiles.length)
            // console.log(`Found: ${walletProfiles.length}`);

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
            // FIXME later
            this.jwtToken = this.jwtToken ? this.jwtToken : "1234";

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

            // Try to connect with JWT backend authentication
            const account = await inAppWalletObject.connect({
                client: this.client,
                strategy: "backend",
                walletSecret: this.jwtToken,
            });

            // const account = await inAppWalletObject.connect({
            //     client: this.client,
            //     strategy: "jwt",
            //     jwt: this.jwtToken,
            // });

            console.log(" New IN APP WALLET:", account);
        } catch (authError) {
            console.error("❌ Backend authentication failed:", authError);
        }
    }

    /**
     * Transfer AVAX from one address to another
     * @param toAddress - The address to receive AVAX
     * @param amount - Amount of AVAX to send (in AVAX, not wei)
     * @param useServerWallet - Whether to use server wallet instead of in-app wallet
     * @param fromAddress - The address to send AVAX from (must have private key access)
     * @returns Transaction receipt
     */
    async transferAVAX(toAddress: string, amount: string, useServerWallet: boolean = true, fromAddress: string = '' ) 
    {
        try {

            // loading information to transfering
            let transferingTo = toAddress;

            // We can load a specific serverWallet or another one if passed the address
            let transferingFrom : Account = (useServerWallet) ? await this.getServerWallet(this.serverWalletAddress) : await this.getServerWallet(fromAddress);         
       
            // Account
            console.log(transferingFrom)
            console.log(this.chain)
            
            // Prepare the transaction, we convert to Wei as Blockchain dont't handle deciamls number
            // natively, wei is the smallest unit of the currency (Eg. AVAX = Dollars ($1.50) | Wei = Cents 150 cents)
            const transaction = prepareTransaction({
                to: transferingTo,
                value: toWei(amount),
                chain: this.chain,
                client: this.client,
            });

            console.log(`Starting AVAX transfer from ${transferingFrom?.address} to ${transferingTo}...`);
            console.log(`Amount: ${amount} AVAX`);

            // Send and confirm the transaction
            const receipt = await sendAndConfirmTransaction({
                transaction,
                account: transferingFrom,
            });

            console.log("✅ Transfer successful!");
            console.log("Transaction hash:", receipt.transactionHash);
            console.log("Block number:", receipt.blockNumber);

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed?.toString(),
                from: fromAddress,
                to: toAddress,
                amount: amount,
            };

        } catch (error) {
            console.error("❌ Error transferring AVAX:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
                from: fromAddress,
                to: toAddress,
                amount: amount,
            };
        }
    }
}

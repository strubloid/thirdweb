import {
    createThirdwebClient,
    Engine,
    getUser,
    NATIVE_TOKEN_ADDRESS,
    prepareTransaction,
    sendAndConfirmTransaction,
    toWei,
    Chain,
    ThirdwebClient
} from "thirdweb";
import {
    inAppWallet,
    getWalletBalance,
    Account,
    getProfiles,
} from "thirdweb/wallets";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { unlinkProfile, authenticate } from "thirdweb/wallets/in-app";

import {
    THIRDWEB_CHAIN,
    THIRDWEB_CLIENT_ID,
    THIRDWEB_CLIENT_SECRET,
    THIRDWEB_SERVER_WALLET_ADDRESS,
} from "../variables";
import { convertCryptoToFiat } from "thirdweb/pay";
import { InAppWallet } from "thirdweb/dist/types/wallets/in-app/core/wallet/types";

export type ThirdwebUserProfile = {
  id: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ThirdwebUser = {
  address: `0x${string}`;
  createdAt: string;
  profiles: ThirdwebUserProfile[];
  updatedAt?: string;
  metadata?: Record<string, any>;
};


export class ThirdwebActions {
    clientId: string;
    clientSecret: string;
    client: any | null = null;
    profiles: any | null = null;
    chain: any;
    developerMode: boolean = true;
    wallets: any | null = null;
    serverWalletAddress: string;
    // userInAppWallet: any | null = null;
    // serverWallet: any | null = null;
    jwtToken: string;

    inAppConfiguration: InAppWallet | null = null;
    inAppAccount: Account | null = null;

    private _initialized: boolean = false;

    constructor() {
        this.clientId = THIRDWEB_CLIENT_ID;
        this.clientSecret = THIRDWEB_CLIENT_SECRET;
        this.serverWalletAddress = THIRDWEB_SERVER_WALLET_ADDRESS;

        // loading the chain based on the developer mode
        this.chain =
            this.developerMode || THIRDWEB_CHAIN == "avalanche-fuji"
                ? avalancheFuji
                : avalanche;

        // FIXME: at the app, change for the request token
        this.jwtToken = "12345678901234567890";

        // connecting to thirdweb client
        this.connectThirdWebClient();
    }



    /**
     * Connects to the thirdweb client.
     * @returns the thirdweb client instance
     */
    connectThirdWebClient() {
        // this will run once, so we are sure to only have one call
        if (this.client == null) {
            this.client = createThirdwebClient({
                clientId: this.clientId,
                secretKey: this.clientSecret,
            });
        }
        return this.client;
    }

    /**
     * This will get the in-app wallet configuration.
     * @returns the in-app wallet configuration
     */
    getInAppConfiguration()
    {
        if (this.inAppConfiguration == null) {
            // Load the in-app wallet configuration
            this.inAppConfiguration = inAppWallet({
                auth: {
                    options: ["backend"],
                },
                executionMode: {
                    mode: "EIP4337",
                    smartAccount: {
                        chain: this.chain,
                        sponsorGas: true,
                    },
                },    
            });
        }

        return this.inAppConfiguration;
    }

    /**
     * This will connect the in-app wallet using the JWT token
     * @param $jwtToken a JWT token to search for the in-app wallet
     * @returns an in-app wallet
     */
    async connectInAppWallet(jwtToken: string) 
    {
        // we try to connect only if we don't have the inAppAccount
        if (this.inAppAccount == null) {
            
            // inApp configuration
            const inAppWalletObject = this.getInAppConfiguration()

            // Try to connect with JWT backend authentication
            // this.inAppAccount = await inAppWalletObject.connect({
            //     client: this.client,
            //     strategy: "jwt",
            //     jwt: jwtToken,
            // });

            // rolling back to the structure that was working
            this.inAppAccount = await inAppWalletObject.connect({
                client: this.client,
                strategy: "backend",
                walletSecret: jwtToken,
            });

        }
    }

    /**
     * This will get the in-app wallet, we will search for the
     * walletSecret (JWT token)
     * @param $jwtToken a JWT token to search for the in-app wallet
     * @returns an in-app wallet
     */
    async getInAppWallet($jwtToken: string) 
    {
        // this will load the inAppAccount
        await this.connectInAppWallet($jwtToken);

        // getting the inAppAccount
        return this.inAppAccount;
    }

    /**
     * Gets the in-app wallet address.
     * @param $jwtToken a JWT token to search for the in-app wallet
     * @returns the in-app wallet address
     */
    async getInAppWalletAddress($jwtToken: string) 
    {
        // this will load the inAppAccount
        await this.connectInAppWallet($jwtToken);

        // getting the inAppAccount
        return this.inAppAccount?.address;
    }

    /**
     * Gets the Thirdweb client instance.
     * @returns The Thirdweb client instance.
     */
    getClient() {
        return this.client;
    }

    /**
     * Gets the server wallets
     * @returns The server wallets instance.
     */
    async getServerWallets() {

        // loading the server wallets
        const response = await Engine.getServerWallets({
            client: this.client,
        });

        // Basic validation of the response
        if (!response || !Array.isArray(response.accounts)) {
            console.error("Failed to load server wallets:", response);
            return [];
        }

        // checking the length of the response
        if (response.accounts.length === 0) {
            console.warn("No server wallets found.");
            return [];
        }

        return response.accounts;
    }

    /**
     * Gets a server wallet by address.
     * @param walletAddress loads this address.
     * @returns The server wallet instance.
     */
    async getServerWallet(walletAddress: string = "") {
        try 
        {
            // attempt to load the server walletAddress
            const serverWallet = await Engine.serverWallet({
                client: this.client,
                address: walletAddress,
            });

            // Basic validation of serverWallet and the address
            if (!serverWallet || !serverWallet.address) {
                console.error("Failed to load server wallet:", serverWallet);
                return null;
            }

            return serverWallet;

        } catch (error) {
            console.error("Error while loading server wallet:", error);
            return null;
        }
    }

    /**
     * Gets all the in-app wallets.
     * @param pageSize The number of wallets to return per page.
     * @param maxPages The maximum number of pages to fetch.
     * @returns A promise that resolves to an array of in-app wallets.
     */
    async getInAppWallets(pageSize?: number, maxPages?: number) : Promise<ThirdwebUser[]> 
    { 
        let page = 1;
        let pagesFetched = 0;
        let hasMore = true;

        const all: ThirdwebUser[] = [];
        const base = "https://api.thirdweb.com/v1/wallets/user";
        const limit = Math.min(Math.max(pageSize ?? 100, 1), 100);

        while (hasMore && (!maxPages || pagesFetched < maxPages)) 
        {
            // Build query string
            const qs = new URLSearchParams({
                limit: String(limit),
                page: String(page),
            });

            // Fetch page
            const res = await fetch(`${base}?${qs.toString()}`, {
                method: "GET",
                headers: { "x-secret-key": this.clientSecret },
            });

            // Basic error handling
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`thirdweb /wallets/user ${res.status}: ${text}`);
            }

            // Parse response
            const json = (await res.json()) as {
                result?: {
                    wallets?: ThirdwebUser[];
                    pagination?: { hasMore?: boolean };
                };
            };

            // getting all wallets
            const wallets = json.result?.wallets ?? [];
            all.push(...wallets);

            // updating the loop variables
            pagesFetched++;
            page++;
            hasMore = Boolean(json.result?.pagination?.hasMore);
        }

        return all;
    }

    /**
     * Adds a new in-app wallet.
     * @returns A promise that resolves when the in-app wallet is added.
     */
    async addInAppWallet(): Promise<Account | null> 
    {
        try 
        {
            const jwtToken = this.jwtToken;

            // Validate JWT token
            if (!jwtToken || typeof jwtToken !== "string" || jwtToken.trim().length < 10) {
                console.error("❌ Invalid or missing JWT token");
                return null;
            }

            // Creating an instance of the in-app wallet
            const account = await this.getInAppWallet(jwtToken);

            // Basic validation of the account and the address
            if (!account || !account.address) {
                console.error("❌ Failed to create or load in-app wallet:", account);
                return null;
            }

            return account;

        } catch (error) {
            console.error("❌ addInAppWallet error:", error);
            return null;
        }
    }

        /**
     * Transfer AVAX from one address to another
     * @param toAddress - The address to receive AVAX
     * @param amount - Amount of AVAX to send (in AVAX, not wei)
     * @param useServerWallet - Whether to use server wallet instead of in-app wallet
     * @param fromAddress - The specific server wallet address to send from (only used when useServerWallet is true)
     * @returns Transaction receipt
     */
    async transferAVAX(toAddress: string, amount: string, useServerWallet: boolean = true, fromAddress: string = "") 
    {
        try 
        {
            let transferingFrom : Account | null = null;

            // loading wallet address should load, can be the server wallet or the in-app wallet
            if(useServerWallet){
                // loading the server wallet address
                transferingFrom = await this.getServerWallet(this.serverWalletAddress);
            } else {
                // if isnt server wallet, we will load the in-app wallet
                transferingFrom = await this.getInAppWallet(this.jwtToken);
            }

            // Check if we successfully got an account
            if (!transferingFrom) {
                throw new Error("Failed to load wallet(from) account for transaction");
            }

            // Prepare the transaction, we convert to Wei as Blockchain dont't handle deciamls number
            // natively, wei is the smallest unit of the currency (Eg. AVAX = Dollars ($1.50) | Wei = Cents 150 cents)
            const transaction = prepareTransaction({
                to: toAddress,
                value: toWei(amount),
                chain: this.chain,
                client: this.client,
            });

            // Send and confirm the transaction
            const receipt = await sendAndConfirmTransaction({
                transaction,
                account: transferingFrom,
            });

            console.log('Used gas? ', receipt.gasUsed?.toString());

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed?.toString(),
                from: transferingFrom.address,
                to: toAddress,
                amount: amount,
            };

        } catch (error) {
            console.error("❌ Error transferring AVAX:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                from: useServerWallet ? (fromAddress || this.serverWalletAddress) : "in-app-wallet",
                to: toAddress,
                amount: amount,
            };
        }
    }

    /**
     * TODO: You need to test if this works as expected
     * 
     * Convert cryptocurrency to fiat currency
     * @param client - The Thirdweb client
     * @param chain - The blockchain chain
     * @param valueToConvert - The amount of cryptocurrency to convert
     * @param coin - The fiat currency to convert to (default: EUR)
     * @returns The converted value in fiat currency
     */
    async convertCryptoToCoin(
        client: ThirdwebClient, chain: Chain, 
        valueToConvert: string, coin: string = "EUR"
    ){
        // This is the returned value variable
        let convertedValue : number = 0;

        // Converting the crypto to fiat value
        let coinValue = await convertCryptoToFiat({
            client: client,
            chain: chain,
            fromTokenAddress: NATIVE_TOKEN_ADDRESS,
            fromAmount: Number(valueToConvert),
            to: coin,
        });

        // checking if we have a result 
        if(coinValue && coinValue.result){
            convertedValue = coinValue.result;
        }

        return convertedValue;

    }
    
    /**
     * Get the in-app wallet balance for a specific coin.
     * @param coin The fiat currency to convert to (default: EUR)
     * @returns The in-app wallet balance in the specified fiat currency
     */
    async getInAppBalance(coin: string = "EUR") 
    {
        try 
        {
            // we are loading only one chain, but we can add any other one and will return all the balances
            let chains = [this.chain];

            // loading the client, user in-app wallet and totalForCoin
            let totalForCoin = 0;
            const client = this.getClient();
            const address = await this.getInAppWalletAddress(this.jwtToken);
            
            // loading the user data
            const user = await getUser({ client, walletAddress: address, });
            
            // checking if we have an address to check it out
            if(address)
            {
                // getting the balances for each chain
                const balances = await Promise.all(
                    chains.map(async (chain) => {
                        
                        // loading the wallet ballance in that chain
                        const walletBalance = await getWalletBalance({ client: client, address: address, chain: chain });
                        const walletStringValue = walletBalance.value.toString();

                        // getting the converted value into a real coin value
                        const convertedValue = await this.convertCryptoToCoin(client, chain, walletStringValue, coin);
                        
                        // building the total for that coin
                        totalForCoin += convertedValue;

                        return {
                            chainId: chain.id,
                            chainName: (chain as any).name ?? `${chain.id}`,
                            native: {
                                symbol: walletBalance.symbol,
                                value: walletBalance.value,
                                convertedValue: convertedValue,
                                displayValue: walletBalance.displayValue,
                                decimals: walletBalance.decimals,
                            },
                        };
                    })
                );
                
            }

            return totalForCoin;

        } catch (error) {
            console.error("Error :", error);
            return false;
        }
    }

    /**
     * Removes all in-app wallets.
     */
    async removeAllInAppWallets(): Promise<void> 
    {
        // loading all profiles of this client
        const walletProfiles = await getProfiles({
            client: this.getClient(),
        });

        console.log('walletProfiles');
        console.log(walletProfiles);

        // this will delete all profiles (if exist) using the unlink profile approach
        if (walletProfiles.length >  0) {

            for (let i = 0; i < walletProfiles.length; i++) {
                let walletProfile = walletProfiles[i];
                await unlinkProfile({
                    client: this.getClient(),
                    profileToUnlink: walletProfile,
                    allowAccountDeletion: true,
                });
            }
            
        }

        // Clear local cache after deletion attempts
        this.wallets = null;

    }

}

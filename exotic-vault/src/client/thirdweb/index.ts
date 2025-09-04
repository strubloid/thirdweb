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
}

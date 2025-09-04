import { createThirdwebClient, Engine } from "thirdweb";

export class ThirdwebClient {
  clientId: string;
  clientSecret: string;
  client: any;
  wallets: any;
  isReady: boolean = false;
  readyPromise: Promise<void>;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.client = createThirdwebClient({
      clientId: this.clientId,
      secretKey: this.clientSecret,
    });
    this.readyPromise = this.init();
  }

  async init() {
    const { Engine } = await import("thirdweb");
    this.wallets = await Engine.getServerWallets({ client: this.client });
    this.isReady = true;
  }

  async getWallets() {
    if (!this.isReady) {
      await this.readyPromise;
    }
    return this.wallets;
  }
}

// Singleton instance
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const clientSecret = import.meta.env.VITE_THIRDWEB_CLIENT_SECRET;
export const thirdweb = new ThirdwebClient(clientId, clientSecret);

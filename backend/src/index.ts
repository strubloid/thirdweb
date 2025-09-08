// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { createThirdwebClient } from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { generatePrivateKey } from 'viem/accounts';

type CreatedWallet = { address: string; privateKey: `0x${string}` };

async function createLocalServerWallet(): Promise<CreatedWallet> {
  
  console.log('Creating local server wallet...');
  
//   const client = createThirdwebClient({
//     // On server, prefer SECRET key. CLIENT_ID optional here.
//     secretKey: process.env.VITE_THIRDWEB_CLIENT_SECRET!,
//     clientId: process.env.VITE_THIRDWEB_CLIENT_ID
//   });

//   // 1) Generate a new EOA private key that YOU control
//   const privateKey = generatePrivateKey();

//   // 2) Turn it into a thirdweb Account bound to this client
//   const account = privateKeyToAccount({ client, privateKey });

  // 3) Return both address + private key
//   return { address: account.address, privateKey };
  return { address: "address", privateKey: "0x1234" };
}

(async () => {
  try 
  {
    // step 1: creating thridweb wallet
    const wallet = await createLocalServerWallet();

    // For dev only — never log private keys in real environments
    console.log('Local EOA Server Wallet (WITH private key):');
    console.log('Address:', wallet.address);
    console.log('PrivateKey:', wallet.privateKey);

  } catch (err) {
    console.error('Failed to create wallet:', err);
    process.exit(1);
  }
})();

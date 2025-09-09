import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { avalancheFuji } from "thirdweb/chains";
import thirdwebIcon from "./thirdweb.svg";

import React, { useEffect, useState } from "react";
import { client } from "./client";

function FundKonviWallet() {
    const faucets = [
        {
            name: "Avalanche Official Faucet",
            url: "https://faucet.avax.network/",
            description:
                "Official Avalanche faucet - requires Core wallet connection",
        },
        {
            name: "Chainlink Faucet",
            url: "https://faucets.chain.link/fuji",
            description:
                "Chainlink's Fuji testnet faucet - requires GitHub account",
        },
    ];

    return (
        <div className="space-y-4">
            {faucets.map((faucet, index) => (
                <div
                    key={index}
                    className="border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">
                                {faucet.name}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {faucet.description}
                            </p>
                        </div>
                        <a
                            href={faucet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                        >
                            Get AVAX
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AVAXTransfer() {
    const [fromAddress, setFromAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [useServerWallet, setUseServerWallet] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferResult, setTransferResult] = useState<any>(null);

    const handleTransfer = async () => {
        if (!toAddress || !amount) {
            alert("Please fill in all fields");
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert("Amount must be greater than 0");
            return;
        }

        setIsTransferring(true);
        setTransferResult(null);

        try {

            const result = await client.transferAVAX(
                toAddress,
                amount,
                useServerWallet,
                fromAddress
            );
            setTransferResult(result);
            console.log(' CHECK HERE  RESULT ')
            console.log(result)

            if (result.success) {
                // Clear form on success
                setFromAddress("");
                setToAddress("");
                setAmount("");
            }
        } catch (error) {
            setTransferResult({
                success: false,
                error:
                    error instanceof Error ? error.message : "Transfer failed",
            });
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                <div>
                    {!useServerWallet && (
                        <>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            From Address (Your Wallet Address)
                            </label>
                            <input type="text"
                                value={fromAddress}
                                onChange={(e) => setFromAddress(e.target.value)}
                                placeholder="0x..."
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none" />

                        </>
                    )}
                    
                    {/* Server Wallet Checkbox */}
                    <div className="mt-3 flex items-center">
                        <input
                            type="checkbox"
                            id="useServerWallet"
                            checked={useServerWallet}
                            onChange={(e) =>
                                setUseServerWallet(e.target.checked)
                            }
                            className="mr-2 w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                            htmlFor="useServerWallet"
                            className="text-sm text-zinc-300"
                        >
                            Use Server Wallet Address
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        To Address (Recipient)
                    </label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Amount (AVAX)
                    </label>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.1"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleTransfer}
                    disabled={
                        isTransferring || !toAddress || !amount
                    }
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
                >
                    {isTransferring ? "Transferring..." : "Transfer AVAX"}
                </button>
            </div>

            {transferResult && (
                <div
                    className={`p-4 rounded ${
                        transferResult.success
                            ? "bg-green-900 border border-green-700"
                            : "bg-red-900 border border-red-700"
                    }`}
                >
                    {transferResult.success ? (
                        <div>
                            <h3 className="font-bold text-green-100 mb-2">
                                ✅ Transfer Successful!
                            </h3>
                            <div className="text-sm text-green-200 space-y-1">
                                <p>
                                    <strong>Transaction Hash:</strong>{" "}
                                    {transferResult.transactionHash}
                                </p>
                                <p>
                                    <strong>Block Number:</strong>{" "}
                                    {transferResult.blockNumber}
                                </p>
                                <p>
                                    <strong>Amount:</strong>{" "}
                                    {transferResult.amount} AVAX
                                </p>
                                <p>
                                    <strong>From:</strong> {transferResult.from}
                                </p>
                                <p>
                                    <strong>To:</strong> {transferResult.to}
                                </p>
                                {transferResult.gasUsed && (
                                    <p>
                                        <strong>Gas Used:</strong>{" "}
                                        {transferResult.gasUsed}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-bold text-red-100 mb-2">
                                ❌ Transfer Failed
                            </h3>
                            <p className="text-sm text-red-200">
                                {transferResult.error}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function App() {
    const [clientInfo, setClientInfo] = useState<any>(null);
    const [loadingClient, setLoadingClient] = useState(true);

    const [serverWallet, setServerWallet] = useState<any>(null);
    const [loadingServerWallet, setLoadingServerWallet] = useState(true);

    const [loadingInAppWalletInEuros, setLoadingInAppWalletInEuros] = useState(true);
    const [inAppWalletInEuros, setInAppWalletInEuros] = useState<any>(null);

    const [inAppWallet, setInAppWallet] = useState<any>(null);
    const [loadingInAppWallet, setLoadingInAppWallet] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setClientInfo(client.getClient());
            setLoadingClient(false);

            setServerWallet(await client.getServerWallets());
            setLoadingServerWallet(false);

            setInAppWallet(await client.getInAppWallets());
            setLoadingInAppWallet(false);
        }
        fetchData();
    }, []);

    // This will handle the reload wallets button click
    const clickReloadServerWallet = async () => {
        setLoadingServerWallet(true);
        setServerWallet(null);
        const serverWallet = await client.getServerWallets();

        setTimeout(() => {
            setServerWallet(serverWallet);
            setLoadingServerWallet(false);
        }, 1000);
    };

    const clickGetInAppWalletInEuros = async () => {
        setLoadingInAppWalletInEuros(true);
        
        const inAppWalletInEuros = await client.getInAppBalance();
        console.log(inAppWalletInEuros);

        setTimeout(() => {
            setLoadingInAppWalletInEuros(false);
            setInAppWalletInEuros(inAppWalletInEuros);
        }, 1000);
    };

    

    // This will handle the reload wallets button click
    const clickReloadInAppWallet = async () => {
        setLoadingInAppWallet(true);
        setInAppWallet(null);
        const wallet = await client.getInAppWallets();

        setTimeout(() => {
            setInAppWallet(wallet);
            setLoadingInAppWallet(false);
        }, 1000);
    };

    /**
     * This will handle the clean inAppWallets button click
     */
    const clickCleanInAppWallet = async () => {
        setLoadingInAppWallet(true);
        setInAppWallet(null);

        await client.cleanInAppWallet();
        const wallets = await client.getInAppWallets();

        setTimeout(() => {
            setInAppWallet(wallets);
            setLoadingInAppWallet(false);
        }, 1000);
    };

    /**
     * This will handle the add inAppWallet button click
     */
    const clickAddInAppWallet = async () => {
        setLoadingInAppWallet(true);
        setInAppWallet(null);

        await client.addInAppWallet();
        const wallets = await client.getInAppWallets();

        setTimeout(() => {
            setInAppWallet(wallets);
            setLoadingInAppWallet(false);
        }, 1000);
    };

    return (
        <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
            <div className="py-20">
                <Header
                    clickReloadServerWallet={clickReloadServerWallet}
                    clickReloadInAppWallet={clickReloadInAppWallet}
                    clickCleanInAppWallet={clickCleanInAppWallet}
                    clickAddInAppWallet={clickAddInAppWallet}
                    clickGetInAppWalletInEuros={clickGetInAppWalletInEuros}
                />
                

                

                {/* Client Block */}
                <div className="my-8 p-4 bg-zinc-900 rounded text-zinc-100">
                    <h2 className="font-bold mb-2">Client</h2>
                    {loadingClient ? (
                        <span>Loading Client...</span>
                    ) : (
                        <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(clientInfo, null, 2)}
                        </pre>
                    )}
                </div>

                {/* ServerWallet Block */}
                <div className="my-8 p-4 bg-zinc-800 rounded text-zinc-100">
                    <h2 className="font-bold mb-2">Server Wallets</h2>
                    {loadingServerWallet ? (
                        <span>Loading wallet...</span>
                    ) : (
                        <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(serverWallet, null, 2)}
                        </pre>
                    )}
                </div>

                {/* ServerInAppWallet Block */}
                <div className="my-8 p-4 bg-zinc-500 rounded text-zinc-100">
                    <h2 className="font-bold mb-2">Server In-App Wallet</h2>
                    {loadingInAppWallet ? (
                        <span>Loading In App wallet...</span>
                    ) : (
                        <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(inAppWallet, null, 2)}
                        </pre>
                    )}
                </div>

                {/* InAppWallet Value */}
                <div className="my-8 p-4 bg-zinc-500 rounded text-zinc-100">
                    <h2 className="font-bold mb-2">Balance in Euros</h2>
                    {loadingInAppWalletInEuros ? (
                        <span>Not Loaded yet, please click the button to load</span>
                    ) : (
                        <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(inAppWalletInEuros, null, 2)}
                        </pre>
                    )}
                </div>

                {/* Fund Wallet Section */}
                <div className="my-2 p-3 bg-red-900 rounded text-zinc-100">
                    <h2 className="font-bold mb-4">Fund Wallet</h2>
                    <FundKonviWallet />
                </div>

                {/* AVAX Transfer Section */}
                <div className="my-8 p-4 bg-blue-900 rounded text-zinc-100">
                    <h2 className="font-bold mb-4">Transfer AVAX</h2>
                    <AVAXTransfer />
                </div>

                <ThirdwebResources />
            </div>
        </main>
    );
}

function Header({
    clickReloadServerWallet,
    clickReloadInAppWallet,
    clickCleanInAppWallet,
    clickAddInAppWallet,
    clickGetInAppWalletInEuros,
}: {
    clickReloadServerWallet: () => Promise<void>;
    clickReloadInAppWallet: () => Promise<void>;
    clickCleanInAppWallet: () => Promise<void>;
    clickAddInAppWallet: () => Promise<void>;
    clickGetInAppWalletInEuros: () => Promise<void>;
}) {
    return (
        <header className="flex flex-col items-center mb-20 md:mb-20">
            <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-6 text-zinc-100">
                thirdweb SDK - Test
            </h1>

            <p className="text-zinc-300 text-base mb-6">
                Read the{" "}
                <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
                    README.md
                </code>{" "}
                file to get started.
            </p>

            {/* Header Buttons Section */}
            <div className="flex gap-4 flex-wrap justify-center">
                <button
                    onClick={clickReloadServerWallet}
                    className="px-4 py-2 bg-blue-400 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    Reload Server Wallet
                </button>
                <button
                    onClick={clickReloadInAppWallet}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    Reload In-App Wallet
                </button>
                <button
                    onClick={clickCleanInAppWallet}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Delete wallets using profile unlinking method"
                >
                    Delete In-App Wallets
                </button>
                <button
                    onClick={clickAddInAppWallet}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                    Add a Wallet
                </button>
                <button
                    onClick={clickGetInAppWalletInEuros}
                    className="px-4 py-2 bg-orange-500 hover:bg-green-700 text-white rounded transition-colors"
                >
                    Value in in-app Wallet
                </button>
            </div>
        </header>
    );
}

function ThirdwebResources() {
    return (
        <div className="grid gap-4 lg:grid-cols-3 justify-center">
            <ArticleCard
                title="thirdweb SDK Docs"
                href="https://portal.thirdweb.com/typescript/v5"
                description="thirdweb TypeScript SDK documentation"
            />

            <ArticleCard
                title="Components and Hooks"
                href="https://portal.thirdweb.com/typescript/v5/react"
                description="Learn about the thirdweb React components and hooks in thirdweb SDK"
            />

            <ArticleCard
                title="thirdweb Dashboard"
                href="https://thirdweb.com/dashboard"
                description="Deploy, configure, and manage your smart contracts from the dashboard."
            />
        </div>
    );
}

function ArticleCard(props: {
    title: string;
    href: string;
    description: string;
}) {
    return (
        <a
            href={`${props.href}?utm_source=vite-template`}
            target="_blank"
            className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
            rel="noreferrer"
        >
            <article>
                <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
                <p className="text-sm text-zinc-400">{props.description}</p>
            </article>
        </a>
    );
}

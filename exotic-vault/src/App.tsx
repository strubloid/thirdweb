import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";

import React, { useEffect, useState } from "react";
import { client } from "./client";

export function App() {
    
    const [clientInfo, setClientInfo] = useState<any>(null);
    const [loadingClient, setLoadingClient] = useState(true);
    
    const [serverWallet, setServerWallet] = useState<any>(null);
    const [loadingServerWallet, setLoadingServerWallet] = useState(true);

    const [inAppWallet, setInAppWallet] = useState<any>(null);
    const [loadingInAppWallet, setLoadingInAppWallet] = useState(true);

    useEffect(() => {
        async function fetchData() {
            
            setClientInfo(client.getClient());
            setLoadingClient(false);

            setServerWallet(await client.getServerWallet());
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
        const serverWallet = await client.getServerWallet();

        setTimeout(() => {
            setServerWallet(serverWallet);
            setLoadingServerWallet(false);
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
                    <h2 className="font-bold mb-2">Server Wallet</h2>
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

                <ThirdwebResources />
            </div>
        </main>
    );
}

function Header({
    clickReloadServerWallet,
    clickReloadInAppWallet,
    clickCleanInAppWallet,
    clickAddInAppWallet
}: {
    clickReloadServerWallet: () => Promise<void>;
    clickReloadInAppWallet: () => Promise<void>;
    clickCleanInAppWallet: () => Promise<void>; 
    clickAddInAppWallet: () => Promise<void>;
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

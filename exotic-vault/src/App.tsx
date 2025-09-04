import { ConnectButton } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";

import React, { useEffect, useState } from "react";
import { client } from "./client";

export function App() {
    const [clientInfo, setClientInfo] = useState<any>(null);
    const [wallets, setWallets] = useState<any>(null);
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingWallets, setLoadingWallets] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setClientInfo(client.getClient());
            setWallets(await client.loadWallets());
            setLoadingClient(false);
            setLoadingWallets(false);
        }
        fetchData();
    }, []);

    // This will handle the reload wallets button click
    const clickReloadWallets = async () => {
        setLoadingWallets(true);
        setWallets(null);
        const newWallets = await client.realoadWallets();
        console.log(newWallets)

        setTimeout(() => {
            setWallets(newWallets);
            setLoadingWallets(false);
        }, 1000);
    };

    // This will handle the reload wallets button click
    const clickCleanWallets = async () => {
        setLoadingWallets(true);
        setWallets(null);

        await client.cleanAllWallets();
        const wallets = await client.getWallets();

        setTimeout(() => {
            setWallets(wallets);
            setLoadingWallets(false);
        }, 1000);

    };
    const clickAddWallets = async () => {
        
        setLoadingWallets(true);
        setWallets(null);

        await client.addTestWallet();
        const wallets = await client.getWallets();

        setTimeout(() => {
            setWallets(wallets);
            setLoadingWallets(false);
        }, 1000);

    };

    

    return (
        <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
            <div className="py-20">
                <Header
                    clickReloadWallets={clickReloadWallets}
                    clickCleanWallets={clickCleanWallets}
                    clickAddWallets={clickAddWallets}
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

                {/* Wallets Block */}
                <div className="my-8 p-4 bg-zinc-800 rounded text-zinc-100">
                    <h2 className="font-bold mb-2">Wallets</h2>
                    {loadingWallets ? (
                        <span>Loading wallets...</span>
                    ) : (
                        <pre className="overflow-x-auto text-xs">
                            {JSON.stringify(wallets, null, 2)}
                        </pre>
                    )}
                </div>

                <ThirdwebResources />
            </div>
        </main>
    );
}

function Header({
    clickReloadWallets,
    clickCleanWallets,
    clickAddWallets
}: {
    clickReloadWallets: () => Promise<void>;
    clickCleanWallets: () => Promise<void>; 
    clickAddWallets: () => Promise<void>;
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
                    onClick={clickReloadWallets}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    Reload Wallets
                </button>
                <button
                    onClick={clickCleanWallets}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Delete wallets using profile unlinking method"
                >
                    Delete All Wallets
                </button>
                <button
                    onClick={clickAddWallets}
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

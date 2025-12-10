import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];

interface Keeper {
    name: string;
    address: string;
    targetBalance: number;
}

const keepers: Keeper[] = [
    {
        name: "leverup-1CT-keeper",
        address: "0x823381c24a940De5a777f87AF21C98701E7C54e0",
        targetBalance: 500,
    },
    {
        name: "leverup-market-order-keeper",
        address: "0x69C350da1c843093aff7aae118aF7fa73E7736F8",
        targetBalance: 500,
    },
    {
        name: "leverup-limit-order-keeper",
        address: "0x5488B138Eb39690ca6fA7C965a8AE631d6802173",
        targetBalance: 500,
    },
    {
        name: "leverup-tp-keeper",
        address: "0xBCDa8c2bb858A14CD227F187321b469370964808",
        targetBalance: 500,
    },
    {
        name: "leverup-sl-keeper",
        address: "0x58FB2095859F60AeaDea06CABaa351e8532BB5B7",
        targetBalance: 500,
    },
    {
        name: "leverup-liq-keeper",
        address: "0xf51189e2f340dc73900ecdbbedd948b52daeb148",
        targetBalance: 500,
    },
    {
        name: "leverup-depth-keeper",
        address: "0xD0a19341579FAF6bb0B17DF628C5a3c7df26E0C2",
        targetBalance: 500,
    },
    {
        name: "leverup-funding-fee-keeper",
        address: "0x94B1613490649Fe8B09Cb190Bc54B8040434D72F",
        targetBalance: 500,
    },
    {
        name: "leverup-oi-limit-keeper",
        address: "0xaE6Ad5e3DfcA9669623033594aee06FFc97Bdbf6",
        targetBalance: 500,
    },
    {
        name: "leverup-wallet-keeper",
        address: "0xe74Bb7Eb178e00adC7d4A22e387560843A8434Ac",
        targetBalance: 5,
    },
    {
        name: "leverup-shared-wallet",
        address: "0x599752B72776AE348cdeDA202FD7360C4a4BdBCB",
        targetBalance: 10,
    }
];


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let rpcUrl = process.env.MONAD_RPC_URL;
    if (!rpcUrl) {
        rpcUrl = "https://rpc1.monad.xyz";
    } else {
        rpcUrl = process.env.MONAD_RPC_URL;
    }

    const network = {
        chainId: 143,
        name: 'monad'
    };

    const errors = [];
    const balances = [];

    for (const keeper of keepers) {
        const provider = new ethers.JsonRpcProvider(rpcUrl, network);
        const balance = await provider.getBalance(keeper.address);
        const formattedBalance = ethers.formatEther(balance);
        if (Number(formattedBalance) < keeper.targetBalance) {
            errors.push({
                name: keeper.name,
                address: keeper.address,
                balance: formattedBalance,
                targetBalance: keeper.targetBalance,
            });
        }
        balances.push({
            name: keeper.name,
            address: keeper.address,
            balance: formattedBalance,
            targetBalance: keeper.targetBalance,
        });
    }

    if (errors.length > 0) {
        return res.status(403).json({ balance: balances, errors: errors });
    } else {
        return res.status(200).json({ balance: balances, errors: [] });
    }

}

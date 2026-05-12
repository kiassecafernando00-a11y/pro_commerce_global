"use server"

import { networkInterfaces } from 'os'

export async function getLocalIp() {
    const nets = networkInterfaces();
    const results: { name: string, ip: string }[] = []

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push({ name, ip: net.address })
            }
        }
    }

    // Prioritize interfaces
    const bestMatch = results.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        // Helper to score interfaces (lower is better)
        const getScore = (name: string, ip: string) => {
            if (ip.startsWith('192.168.56.')) return 100; // VirtualBox often uses this range
            if (name.includes('vethernet')) return 50; // WSL/Hyper-V
            if (name.includes('virtual')) return 50;
            if (name.includes('wi-fi')) return 1;
            if (name.includes('wireless')) return 1;
            if (name.includes('ethernet')) return 2;
            if (ip.startsWith('192.168.')) return 10;
            if (ip.startsWith('10.')) return 20;
            return 30;
        }

        return getScore(nameA, a.ip) - getScore(nameB, b.ip);
    })[0];

    const bestIp = bestMatch ? bestMatch.ip : 'localhost';

    console.log("Server IP Detected:", bestIp, "From Interface:", bestMatch?.name)

    return bestIp
}

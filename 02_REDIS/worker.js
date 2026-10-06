import { namespaceTable, expiryTable } from "./evalCommand.js";

function randomSampling() {
    const keys = Array.from(expiryTable.keys());
    if (keys.length === 0) return 0;
    const sampleSize = Math.min(20, keys.length);
    let expiredCount = 0;
    const now = Date.now();

    for (let i = 0; i < sampleSize; i++) {
        const j = i + Math.floor(Math.random() * (keys.length - i));
        const key = keys[j];
        [keys[i], keys[j]] = [keys[j], keys[i]];
        const expiryTime = expiryTable.get(key);
        if (expiryTime && now > expiryTime) {
            namespaceTable.delete(key);
            expiryTable.delete(key);
            expiredCount++;
        }
    }

    return { sampleSize, expiredCount };
}

async function allWorks() {
    const startTime = Date.now();
    const MAX_TIME_MS = 25;

    while (expiryTable.size > 0) {
        const { sampleSize, expiredCount } = randomSampling();
        if (sampleSize === 0 || (expiredCount / sampleSize) < 0.25) {
            break;
        }

        if (Date.now() - startTime > MAX_TIME_MS) {
            break;
        }
    }
}


let running = true;
async function main() {
    while (running) {
        try {
            await allWorks();
        } catch (error) {
            console.log(`Error in job, ${error}`)
        } await new Promise((r) => setTimeout(r, 100));
    }
    console.log("Worker stopped cleanly")
}

process.on("SIGTERM", () => { running = false; });
process.on("SIGINT", () => { running = false; });

main();
import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerPath = path.join(__dirname, "utils", "simWorker.js");

class simulateService {
    runInWorker = (workerData) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(workerPath, { workerData });

            worker.on("message", (data) => {
                resolve(data);
            });

            worker.on("error", (err) => {
                reject(err);
            });

            worker.on("exit", (code) => {
                if (code !== 0) {
                    reject(new Error(`Simulation worker stopped with exit code ${code}`));
                }
            });
        });
    };

    simulate = async ({ servers, keys, seed, operations }) => {
        const [naiveSteps, circularSteps, virtualSteps] = await Promise.all([
            this.runInWorker({ type: "naive", servers, keys, operations }),
            this.runInWorker({ type: "circular", servers, keys, operations }),
            this.runInWorker({ type: "virtual", servers, keys, operations })
        ]);

        return {
            naive: naiveSteps,
            circular: circularSteps,
            virtual: virtualSteps
        };
    };
}

export default simulateService;

import net from "net";
import decode from "./decode.js";
import evalCommand from "./evalCommand.js";
import { allWorks } from "./worker.js";
import { initSharedIntegers } from "./redisObject.js";

let lastWorkerRun = 0;
const WORKER_INTERVAL_MS = 100;

function checkAndRunWorker() {
    const now = Date.now();
    if (now - lastWorkerRun >= WORKER_INTERVAL_MS) {
        allWorks();
        lastWorkerRun = now;
    }
}

const server = net.createServer((socket) => {
    console.log("New client connected");

    socket.setEncoding("utf8"); 
    let pending = "";

    socket.on("data", (chunk) => {
        checkAndRunWorker();

        pending += chunk;

        let result;
        while (pending.length > 0 && (result = decode(pending)) !== null) {
            const [command, consumed] = result;
            pending = pending.slice(consumed);

            console.log("Parsed:", command);
            socket.write(evalCommand(command));
        }
    });

    socket.on("error", (err) => {
        if (err.code !== "ECONNRESET") {
            console.error("Client error:", err.message);
        }
    });

    socket.on("close", () => {
        console.log("Client disconnected");
    });
});

initSharedIntegers();
console.log("Shared integer pool (0-9999) initialized");

server.listen(6381, "0.0.0.0", () => {
    console.log("Redis server listening on port 6381");
});
import net from "net";
import decode from "./decode.js"

const waitingClients = [];
let activeClient = null;

function processNextClient() {
    if (activeClient || waitingClients.length === 0) {
        return;
    }

    activeClient = waitingClients.shift();
    const client = activeClient;

    console.log("Now serving a client");

    client.setEncoding("utf8");
    let pending = "";

    client.on("data", (chunk) => {
        pending += chunk;

        let result;
        while (pending.length > 0 && (result = decode(pending)) !== null) {
            const [command, consumed] = result;
            pending = pending.slice(consumed);

            console.log("Parsed:", command);
            client.write(`+${JSON.stringify(command)}\r\n`);
        }
    });

    client.on("error", (err) => {
        console.error("Client error:", err.message);
    });

    client.on("close", () => {
        console.log("Client disconnected");
        activeClient = null;
        processNextClient();
    });
}

const server = net.createServer((socket) => {
    console.log("New client connected");
    socket.on("error", (err) => {
        console.error("Socket error:", err.message);
    });
    waitingClients.push(socket);
    processNextClient();
});

server.listen(6381, "0.0.0.0", () => {
    console.log("Server listening on port 6381");
});
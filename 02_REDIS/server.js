import net from "net";

const waitingClients = [];
let activeClient = null;

function processNextClient() {
    if (activeClient || waitingClients.length === 0) {
        return;
    }

    activeClient = waitingClients.shift();

    console.log("Now serving a client");

    activeClient.on("data", (data) => {
        const realData = data.toString("utf-8");
        console.log("Received:", realData);
        activeClient.write(realData);
    });

    activeClient.on("close", () => {
        console.log("Client disconnected");

        activeClient = null;

        processNextClient();
    });
}

const server = net.createServer((socket) => {
    console.log("New client connected");

    waitingClients.push(socket);

    processNextClient();
});

server.listen(6381, "0.0.0.0", () => {
    console.log("Server listening on port 6381");
});
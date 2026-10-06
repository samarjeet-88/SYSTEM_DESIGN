export const namespaceTable = new Map();
export const expiryTable = new Map();

function evalCommand(command) {
    const args = Array.isArray(command) ? command : [command];
    const name = String(args[0]).toUpperCase();

    switch (name) {
        case "PING": {
            if (args.length > 2) {
                return "-ERR wrong number of arguments for 'ping' command\r\n";
            }
            if (args.length === 2) {
                return `$${args[1].length}\r\n${args[1]}\r\n`;
            }
            return "+PONG\r\n";
        }

        case "SET": {
            if (args.length !== 3 && args.length !== 5) {
                return "-ERR syntax error\r\n";
            }

            const key = args[1];
            const value = args[2];

            namespaceTable.set(key, value);

            if (args.length === 5) {
                const option = String(args[3]).toUpperCase();
                const duration = Number(args[4]);

                if (isNaN(duration) || duration <= 0) {
                    return "-ERR value is not an integer or out of range\r\n";
                }

                if (option === "EX") {
                    expiryTable.set(key, Date.now() + duration * 1000);
                } else if (option === "PX") {
                    expiryTable.set(key, Date.now() + duration);
                } else {
                    return "-ERR syntax error\r\n";
                }
            } else {
                expiryTable.delete(key);
            }

            return "+OK\r\n";
        }

        case "GET": {
            if (args.length !== 2) {
                return "-ERR wrong number of arguments for 'get' command\r\n";
            }

            const key = args[1];

            if (expiryTable.has(key)) {
                const expiryTime = expiryTable.get(key);
                if (Date.now() > expiryTime) {
                    namespaceTable.delete(key);
                    expiryTable.delete(key);
                    return "$-1\r\n";
                }
            }

            const value = namespaceTable.get(key);
            if (value === undefined) {
                return "$-1\r\n";
            }

            return `$${value.length}\r\n${value}\r\n`;
        }

        case "TTL": {
            if (args.length !== 2) {
                return "-ERR wrong number of arguments for 'ttl' command\r\n";
            }

            const key = args[1];

            if (!namespaceTable.has(key)) {
                return ":-2\r\n";
            }

            if (!expiryTable.has(key)) {
                return ":-1\r\n";
            }

            const expiryTime = expiryTable.get(key);
            const currentTime = Date.now();

            if (currentTime > expiryTime) {
                namespaceTable.delete(key);
                expiryTable.delete(key);
                return ":-2\r\n";
            }

            const remainingSeconds = Math.round((expiryTime - currentTime) / 1000);
            return `:${remainingSeconds}\r\n`;
        }

        default:
            return `-ERR unknown command '${args[0]}'\r\n`;
    }
}

export default evalCommand;
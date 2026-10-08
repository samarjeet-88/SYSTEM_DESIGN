import { createStringObject, getStringValue, decrRefCount } from './redisObject.js';

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
            const rawValue = args[2];

            // Decrement refcount of old value if key already exists
            const oldRobj = namespaceTable.get(key);
            if (oldRobj) decrRefCount(oldRobj);

            const robj = createStringObject(rawValue);
            namespaceTable.set(key, robj);

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

            const robj = namespaceTable.get(key);
            if (robj === undefined) {
                return "$-1\r\n";
            }

            const value = getStringValue(robj);
            const byteLength = Buffer.byteLength(value, 'utf8');
            return `$${byteLength}\r\n${value}\r\n`;
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
        case "DEL": {
            if (args.length < 2) {
                return "-ERR wrong number of arguments for 'del' command\r\n";
            }

            let deletedCount = 0;
            const now = Date.now();

            for (let i = 1; i < args.length; i++) {
                const key = args[i];

                if (namespaceTable.has(key)) {
                    const isExpired = expiryTable.has(key) && now > expiryTable.get(key);

                    // Decrement refcount of the deleted value
                    const robj = namespaceTable.get(key);
                    if (robj) decrRefCount(robj);

                    namespaceTable.delete(key);
                    expiryTable.delete(key);

                    if (!isExpired) {
                        deletedCount++;
                    }
                }
            }

            return `:${deletedCount}\r\n`;
        }

        case "EXPIRE": {
            if (args.length !== 3) {
                return "-ERR wrong number of arguments for 'expire' command\r\n";
            }

            const key = args[1];
            const seconds = Number(args[2]);

            if (isNaN(seconds)) {
                return "-ERR value is not an integer or out of range\r\n";
            }
            if (!namespaceTable.has(key)) {
                return ":0\r\n";
            }

            const now = Date.now();

            if (expiryTable.has(key) && now > expiryTable.get(key)) {
                namespaceTable.delete(key);
                expiryTable.delete(key);
                return ":0\r\n";
            }

            if (seconds <= 0) {
                namespaceTable.delete(key);
                expiryTable.delete(key);
                return ":1\r\n";
            }

            const newExpiryTime = now + seconds * 1000;
            expiryTable.set(key, newExpiryTime);
            return ":1\r\n";
        }

        default:
            return `-ERR unknown command '${args[0]}'\r\n`;
    }
}

export default evalCommand;
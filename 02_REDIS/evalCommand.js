function evalCommand(command) {
    const args = Array.isArray(command) ? command : [command];
    const name = String(args[0]).toUpperCase();
    switch (name) {
        case "PING":
            if (args.length > 2) {
                return "-ERR wrong number of arguments for 'ping' command\r\n";
            }
            if (args.length === 2) {
                return `$${args[1].length}\r\n${args[1]}\r\n`;
            }
            return "+PONG\r\n";

        default:
            return `-ERR unknown command '${args[0]}'\r\n`;
    }
}

export default evalCommand;
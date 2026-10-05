import { parentPort, workerData } from "node:worker_threads";
import naiveService from "../services/naiveService.js";
import circularService from "../services/circularService.js";
import virtualService from "../services/virtualService.js";

const { type, servers, keys, operations } = workerData;

const steps = [];

if (type === "virtual") {
    const initial = virtualService.initVirtualConsistentHashing({ servers, keys });
    let serverTiers = new Map(initial.serverTiers);

    steps.push({
        step: 0,
        operation: "INIT",
        servers: serverTiers.size,
        activeServers: Array.from(serverTiers.keys()),
        stats: initial.stats
    });

    for (let i = 0; i < operations.length; i++) {
        const rawOp = operations[i].trim();
        const [action, serverIdStr, tierStr] = rawOp.split(/\s+/);
        const serverId = parseInt(serverIdStr, 10);
        const tier = tierStr ? tierStr.toUpperCase() : "MEDIUM";

        let result;

        if (action === "ADD") {
            result = virtualService.addServer({ serverTiers, serverId, tier, keys });
            serverTiers = result.serverTiers;
        } else if (action === "REMOVE") {
            result = virtualService.removeServer({ serverTiers, serverId, keys });
            serverTiers = result.serverTiers;
        }

        steps.push({
            step: i + 1,
            operation: rawOp,
            servers: serverTiers.size,
            activeServers: Array.from(serverTiers.keys()),
            stats: result.stats
        });
    }
} else {
    const service = type === "naive" ? naiveService : circularService;
    const initMethod = type === "naive"
        ? "initNaiveConsistentHashing"
        : "initCircularConsistentHashing";

    const initial = service[initMethod]({ servers, keys });
    let activeServers = [...initial.activeServers];

    steps.push({
        step: 0,
        operation: "INIT",
        servers: activeServers.length,
        activeServers: [...activeServers],
        stats: initial.stats
    });

    for (let i = 0; i < operations.length; i++) {
        const rawOp = operations[i].trim();
        const [action, serverIdStr] = rawOp.split(/\s+/);
        const serverId = parseInt(serverIdStr, 10);

        let result;

        if (action === "ADD") {
            result = service.addServer({ activeServers, serverId, keys });
            activeServers = [...result.activeServers];
        } else if (action === "REMOVE") {
            result = service.removeServer({ activeServers, serverId, keys });
            activeServers = [...result.activeServers];
        }

        steps.push({
            step: i + 1,
            operation: rawOp,
            servers: activeServers.length,
            activeServers: [...activeServers],
            stats: result.stats
        });
    }
}

parentPort.postMessage(steps);

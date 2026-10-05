class naiveService {
    static getStats = (map, totalKeys, activeServers, remappedCount = 0) => {
        const keysPerNode = {};
        let maxKeys = 0;

        for (const s of activeServers) {
            const count = map.get(s)?.length || 0;
            keysPerNode[s] = count;
            if (count > maxKeys) maxKeys = count;
        }

        const numServers = activeServers.length;
        const meanKeys = numServers > 0 ? totalKeys / numServers : 0;
        const fractionRemapped = totalKeys > 0 ? remappedCount / totalKeys : 0;

        return {
            keysPerNode,
            maxKeysOnNode: maxKeys,
            meanKeysPerNode: Number(meanKeys.toFixed(2)),
            remappedKeysCount: remappedCount,
            fractionRemapped: Number(fractionRemapped.toFixed(4))
        };
    };

    static initNaiveConsistentHashing = ({ servers, keys }) => {
        const activeServers = Array.from({ length: servers }, (_, i) => i + 1);
        const map = new Map();
        for (const s of activeServers) {
            map.set(s, []);
        }

        for (let i = 1; i <= keys; i++) {
            const serverId = activeServers[i % activeServers.length];
            map.get(serverId).push(i);
        }

        return {
            map,
            activeServers,
            keys,
            stats: naiveService.getStats(map, keys, activeServers, 0)
        };
    };

    static addServer = ({ activeServers, serverId, keys }) => {
        const nextActiveServers = [...activeServers, serverId];
        const newMap = new Map();

        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const oldServerId = activeServers[i % activeServers.length];
            const newServerId = nextActiveServers[i % nextActiveServers.length];

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            map: newMap,
            activeServers: nextActiveServers,
            keys,
            stats: naiveService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };

    static removeServer = ({ activeServers, serverId, keys }) => {
        const nextActiveServers = activeServers.filter(s => s !== serverId);
        const newMap = new Map();

        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const oldServerId = activeServers[i % activeServers.length];
            const newServerId = nextActiveServers[i % nextActiveServers.length];

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            map: newMap,
            activeServers: nextActiveServers,
            keys,
            stats: naiveService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };
}

export default naiveService;

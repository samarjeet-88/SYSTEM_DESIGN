import mmh3 from "imurmurhash";

class circularService {
    static hashValue = (value) => {
        return mmh3(String(value)).result();
    };

    static findKeyIdx = (serverArr, hashKey) => {
        let low = 0, high = serverArr.length - 1;
        let idx = 0; // Default wrap-around to first node

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (serverArr[mid].hash >= hashKey) {
                idx = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return idx;
    };

    static buildRing = (activeServers) => {
        const ring = activeServers.map(s => ({
            id: s,
            hash: circularService.hashValue(`server_${s}`)
        }));
        ring.sort((a, b) => a.hash - b.hash);
        return ring;
    };

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

    static initCircularConsistentHashing = ({ servers, keys }) => {
        const activeServers = Array.from({ length: servers }, (_, i) => i + 1);
        const ring = circularService.buildRing(activeServers);
        const map = new Map();
        for (const s of activeServers) {
            map.set(s, []);
        }

        for (let i = 1; i <= keys; i++) {
            const hashKey = circularService.hashValue(`key_${i}`);
            const idx = circularService.findKeyIdx(ring, hashKey);
            const serverId = ring[idx].id;
            map.get(serverId).push(i);
        }

        return {
            ring,
            activeServers,
            map,
            keys,
            stats: circularService.getStats(map, keys, activeServers, 0)
        };
    };

    static addServer = ({ activeServers, serverId, keys }) => {
        const nextActiveServers = [...activeServers, serverId];
        const oldRing = circularService.buildRing(activeServers);
        const newRing = circularService.buildRing(nextActiveServers);

        const newMap = new Map();
        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const hashKey = circularService.hashValue(`key_${i}`);

            const oldIdx = circularService.findKeyIdx(oldRing, hashKey);
            const oldServerId = oldRing[oldIdx].id;

            const newIdx = circularService.findKeyIdx(newRing, hashKey);
            const newServerId = newRing[newIdx].id;

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            ring: newRing,
            activeServers: nextActiveServers,
            map: newMap,
            keys,
            stats: circularService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };

    static removeServer = ({ activeServers, serverId, keys }) => {
        const nextActiveServers = activeServers.filter(s => s !== serverId);
        const oldRing = circularService.buildRing(activeServers);
        const newRing = circularService.buildRing(nextActiveServers);

        const newMap = new Map();
        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const hashKey = circularService.hashValue(`key_${i}`);

            const oldIdx = circularService.findKeyIdx(oldRing, hashKey);
            const oldServerId = oldRing[oldIdx].id;

            const newIdx = circularService.findKeyIdx(newRing, hashKey);
            const newServerId = newRing[newIdx].id;

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            ring: newRing,
            activeServers: nextActiveServers,
            map: newMap,
            keys,
            stats: circularService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };
}

export default circularService;

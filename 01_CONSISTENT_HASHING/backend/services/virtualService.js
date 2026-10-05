import mmh3 from "imurmurhash";

class virtualService {
    static BASE_VNODES = 3;

    static MULTIPLIERS = {
        LOW: 0.25,
        MEDIUM: 1.0,
        HIGH: 3.0
    };

    static hashValue = (value) => {
        return mmh3(String(value)).result();
    };
    static getVNodesCount = (tier = "MEDIUM", baseVNodes = virtualService.BASE_VNODES) => {
        const num = Number(tier);
        if (!isNaN(num) && num > 0) {
            return Math.max(1, Math.round(baseVNodes * num));
        }
        const normalizedTier = String(tier).toUpperCase();
        const multiplier = virtualService.MULTIPLIERS[normalizedTier] ?? virtualService.MULTIPLIERS.MEDIUM;
        return Math.max(1, Math.round(baseVNodes * multiplier));
    };
    static findKeyIdx = (ring, hashKey) => {
        let low = 0, high = ring.length - 1;
        let idx = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (ring[mid].hash >= hashKey) {
                idx = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return idx;
    };


    static buildRing = (serverTiersMap, baseVNodes = virtualService.BASE_VNODES) => {
        const ring = [];

        for (const [serverId, tier] of serverTiersMap.entries()) {
            const vnodeCount = virtualService.getVNodesCount(tier, baseVNodes);
            for (let v = 1; v <= vnodeCount; v++) {
                ring.push({
                    id: serverId,
                    vnode: v,
                    hash: virtualService.hashValue(`server_${serverId}_vnode_${v}`)
                });
            }
        }

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

    static initVirtualConsistentHashing = ({ servers, keys, baseVNodes = virtualService.BASE_VNODES, defaultTier = "MEDIUM" }) => {
        const serverTiers = new Map();
        for (let s = 1; s <= servers; s++) {
            serverTiers.set(s, defaultTier);
        }

        const activeServers = Array.from(serverTiers.keys());
        const ring = virtualService.buildRing(serverTiers, baseVNodes);

        const map = new Map();
        for (const s of activeServers) {
            map.set(s, []);
        }

        for (let i = 1; i <= keys; i++) {
            const hashKey = virtualService.hashValue(`key_${i}`);
            const idx = virtualService.findKeyIdx(ring, hashKey);
            const serverId = ring[idx].id;
            map.get(serverId).push(i);
        }

        return {
            ring,
            serverTiers,
            activeServers,
            map,
            keys,
            stats: virtualService.getStats(map, keys, activeServers, 0)
        };
    };


    static addServer = ({ serverTiers, serverId, tier = "MEDIUM", keys, baseVNodes = virtualService.BASE_VNODES }) => {
        const nextServerTiers = new Map(serverTiers);
        nextServerTiers.set(serverId, tier);

        const activeServers = Array.from(serverTiers.keys());
        const nextActiveServers = Array.from(nextServerTiers.keys());

        const oldRing = virtualService.buildRing(serverTiers, baseVNodes);
        const newRing = virtualService.buildRing(nextServerTiers, baseVNodes);

        const newMap = new Map();
        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const hashKey = virtualService.hashValue(`key_${i}`);

            const oldIdx = virtualService.findKeyIdx(oldRing, hashKey);
            const oldServerId = oldRing[oldIdx].id;

            const newIdx = virtualService.findKeyIdx(newRing, hashKey);
            const newServerId = newRing[newIdx].id;

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            ring: newRing,
            serverTiers: nextServerTiers,
            activeServers: nextActiveServers,
            map: newMap,
            keys,
            stats: virtualService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };

    static removeServer = ({ serverTiers, serverId, keys, baseVNodes = virtualService.BASE_VNODES }) => {
        const nextServerTiers = new Map(serverTiers);
        nextServerTiers.delete(serverId);

        const activeServers = Array.from(serverTiers.keys());
        const nextActiveServers = Array.from(nextServerTiers.keys());

        const oldRing = virtualService.buildRing(serverTiers, baseVNodes);
        const newRing = virtualService.buildRing(nextServerTiers, baseVNodes);

        const newMap = new Map();
        for (const s of nextActiveServers) {
            newMap.set(s, []);
        }

        let remappedCount = 0;

        for (let i = 1; i <= keys; i++) {
            const hashKey = virtualService.hashValue(`key_${i}`);

            const oldIdx = virtualService.findKeyIdx(oldRing, hashKey);
            const oldServerId = oldRing[oldIdx].id;

            const newIdx = virtualService.findKeyIdx(newRing, hashKey);
            const newServerId = newRing[newIdx].id;

            if (oldServerId !== newServerId) {
                remappedCount++;
            }

            newMap.get(newServerId).push(i);
        }

        return {
            ring: newRing,
            serverTiers: nextServerTiers,
            activeServers: nextActiveServers,
            map: newMap,
            keys,
            stats: virtualService.getStats(newMap, keys, nextActiveServers, remappedCount)
        };
    };
}

export default virtualService;

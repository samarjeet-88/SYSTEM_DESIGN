import simulateService from "./service.js";

const simulateServiceObj = new simulateService();

class simulateController {

    static simulate = async (req, res) => {
        const { servers, keys, seed, operations } = req.body;

        if (typeof servers !== "number" || typeof keys !== "number" || typeof seed !== "number" || !Array.isArray(operations)) {
            return res.status(400).json({
                success: false,
                message: "Field Datatype is wrong"
            });
        }

        if (servers < 20 || servers > 10000 || keys < 1000 || keys > 1000000 || seed < 1 || seed > 10000 || operations.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Field Constraints are violated"
            });
        }

        // Initialize active servers set: 1 to servers
        const activeServers = new Set(Array.from({ length: servers }, (_, i) => i + 1));

        for (let i = 0; i < operations.length; i++) {
            const rawOp = typeof operations[i] === "string" ? operations[i].trim() : "";
            const parts = rawOp.split(/\s+/);

            if (parts.length < 2 || parts.length > 3) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid operation format at index ${i}: "${operations[i]}". Expected "ADD <serverId> [tier/weight]" or "REMOVE <serverId>"`
                });
            }

            const action = parts[0].toUpperCase();
            const serverIdStr = parts[1];
            const serverId = parseInt(serverIdStr, 10);

            if (isNaN(serverId) || serverId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid server ID "${serverIdStr}" at index ${i}. Must be a positive integer.`
                });
            }

            if (action === "ADD") {
                if (activeServers.has(serverId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot ADD server ${serverId} at index ${i}: Server ${serverId} already exists.`
                    });
                }

                if (activeServers.size + 1 > 10000) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot ADD server ${serverId} at index ${i}: Server count cannot exceed 10000.`
                    });
                }

                activeServers.add(serverId);
            } else if (action === "REMOVE") {
                if (parts.length !== 2) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid REMOVE format at index ${i}: "${operations[i]}". Expected "REMOVE <serverId>"`
                    });
                }

                if (!activeServers.has(serverId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot REMOVE server ${serverId} at index ${i}: Server ${serverId} does not exist.`
                    });
                }

                if (activeServers.size - 1 < 20) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot REMOVE server ${serverId} at index ${i}: Server count cannot drop below 20.`
                    });
                }

                activeServers.delete(serverId);
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Invalid action "${action}" at index ${i}. Expected "ADD" or "REMOVE".`
                });
            }
        }

        const ans = await simulateServiceObj.simulate({ servers, keys, seed, operations });

        return res.status(200).json({
            success: true,
            data: ans
        });
    };
}

export default simulateController;
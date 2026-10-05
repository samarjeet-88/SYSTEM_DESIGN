const stepSchema = {
    type: "object",
    properties: {
        step: {
            type: "integer",
            example: 0
        },
        operation: {
            type: "string",
            example: "INIT"
        },
        servers: {
            type: "integer",
            example: 20
        },
        stats: {
            type: "object",
            properties: {
                keysPerNode: {
                    type: "object",
                    additionalProperties: {
                        type: "integer"
                    },
                    example: { "1": 500, "2": 500 }
                },
                maxKeysOnNode: {
                    type: "integer",
                    example: 500
                },
                meanKeysPerNode: {
                    type: "number",
                    example: 500.00
                },
                remappedKeysCount: {
                    type: "integer",
                    example: 0
                },
                fractionRemapped: {
                    type: "number",
                    example: 0.0000
                }
            }
        }
    }
};

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "Consistent Hashing Simulator API",
        version: "1.0.0",
        description: "API for simulating and comparing Naive Modulo Hashing, Circular Consistent Hashing, and Virtual Node Consistent Hashing in parallel worker threads."
    },
    servers: [
        {
            url: "http://localhost:8000",
            description: "Local Development Server"
        }
    ],
    paths: {
        "/api/v1/simulate": {
            post: {
                summary: "Run Parallel Consistent Hashing Simulations",
                description: "Spawns worker threads to execute Naive and Circular consistent hashing simulations simultaneously.",
                tags: ["Simulation"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["servers", "keys", "seed", "operations"],
                                properties: {
                                    servers: {
                                        type: "integer",
                                        minimum: 20,
                                        maximum: 10000,
                                        example: 20,
                                        description: "Initial number of servers (20 - 10000)"
                                    },
                                    keys: {
                                        type: "integer",
                                        minimum: 1000,
                                        maximum: 1000000,
                                        example: 10000,
                                        description: "Total number of keys to distribute (1000 - 1000000)"
                                    },
                                    seed: {
                                        type: "integer",
                                        minimum: 1,
                                        maximum: 10000,
                                        example: 42,
                                        description: "Random seed value (1 - 10000)"
                                    },
                                    operations: {
                                        type: "array",
                                        minItems: 1,
                                        maxItems: 50,
                                        items: {
                                            type: "string"
                                        },
                                        example: ["ADD 21", "REMOVE 5", "ADD 22"],
                                        description: "List of server operations to simulate with server IDs (e.g., 'ADD 21', 'REMOVE 5')"
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Simulation executed successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                naive: {
                                                    type: "array",
                                                    items: stepSchema
                                                },
                                                circular: {
                                                    type: "array",
                                                    items: stepSchema
                                                },
                                                virtual: {
                                                    type: "array",
                                                    items: stepSchema
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Invalid input or constraint violation",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: false
                                        },
                                        message: {
                                            type: "string",
                                            example: "Field Constraints are violated"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default swaggerDocument;

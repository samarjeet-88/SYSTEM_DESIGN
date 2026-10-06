function decode(data, offset = 0) {
    const lineEnd = data.indexOf("\r\n", offset);
    if (lineEnd === -1) return null;

    const type = data[offset];
    const line = data.slice(offset + 1, lineEnd);
    const next = lineEnd + 2;

    switch (type) {
        case "+":
            return [line, next];

        case "-":
            return [new Error(line), next];

        case ":":
            return [parseInt(line, 10), next];

        case "$": {
            const length = parseInt(line, 10);
            if (length === -1) return [null, next];

            const end = next + length;
            if (data.length < end + 2) return null;
            return [data.slice(next, end), end + 2];
        }

        case "*": {
            const count = parseInt(line, 10);
            if (count === -1) return [null, next];

            const items = [];
            let pos = next;
            for (let i = 0; i < count; i++) {
                const result = decode(data, pos);
                if (result === null) return null;
                items.push(result[0]);
                pos = result[1];
            }
            return [items, pos];
        }

        default:
            throw new Error(`Invalid RESP type: ${type}`);
    }
}

export default decode;
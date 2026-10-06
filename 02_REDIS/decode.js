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
        // adding inline command support because redis benchmark sends inline not in the RESP format
        default: {
            const fullLine = data.slice(offset, lineEnd).trim();
            if (fullLine.length === 0) {
                return [[], next];
            }
            const items = fullLine.split(/\s+/);
            return [items, next];
        }
    }
}

export default decode;
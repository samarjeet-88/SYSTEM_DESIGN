import {
    OBJ_STRING,
    OBJ_ENCODING_RAW,
    OBJ_ENCODING_INT,
    OBJ_ENCODING_EMBSTR,
    OBJ_ENCODING_EMBSTR_SIZE_LIMIT,
    OBJ_SHARED_INTEGERS,
    OFFSET_TYPE_ENC,
    OFFSET_REFCOUNT,
    OFFSET_SDS_LEN,
    OFFSET_SDS_ALLOC,
    OFFSET_DATA,
    OFFSET_SDS_BLOCK_LEN,
    OFFSET_SDS_BLOCK_ALLOC,
    OFFSET_SDS_BLOCK_DATA,
    createTypeEncoding,
    getObjectEncoding
} from './constant.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const sharedIntegers = new Array(OBJ_SHARED_INTEGERS);

export function initSharedIntegers() {
    for (let i = 0; i < OBJ_SHARED_INTEGERS; i++) {
        sharedIntegers[i] = createIntStringObject(i);
    }
}

export function getRefCount(robj) {
    const view = new DataView(robj.buffer, robj.byteOffset, robj.byteLength);
    return view.getInt32(OFFSET_REFCOUNT, true);
}

export function incrRefCount(robj) {
    const view = new DataView(robj.buffer, robj.byteOffset, robj.byteLength);
    const current = view.getInt32(OFFSET_REFCOUNT, true);
    view.setInt32(OFFSET_REFCOUNT, current + 1, true);
}

export function decrRefCount(robj) {
    const view = new DataView(robj.buffer, robj.byteOffset, robj.byteLength);
    const current = view.getInt32(OFFSET_REFCOUNT, true);
    view.setInt32(OFFSET_REFCOUNT, current - 1, true);
    return current - 1;
}

export function createIntStringObject(val) {
    const totalSize = OFFSET_DATA + 8;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const u8 = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    u8[OFFSET_TYPE_ENC] = createTypeEncoding(OBJ_STRING, OBJ_ENCODING_INT);
    incrRefCount(u8);
    view.setBigInt64(OFFSET_DATA, BigInt(val), true);

    return u8;
}

export function createEmbeddedStringObject(str) {
    const strBytes = encoder.encode(str);
    const len = strBytes.length;

    const totalSize = OFFSET_DATA + len + 1;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const u8 = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    u8[OFFSET_TYPE_ENC] = createTypeEncoding(OBJ_STRING, OBJ_ENCODING_EMBSTR);
    view.setInt32(OFFSET_REFCOUNT, 1, true);
    view.setUint32(OFFSET_SDS_LEN, len, true);
    // In Redis implementation alloc is greater than or equal to len, here we set it to len
    view.setUint32(OFFSET_SDS_ALLOC, len, true);

    u8.set(strBytes, OFFSET_DATA);
    u8[OFFSET_DATA + len] = 0;

    return u8;
}

export function createSds(str) {
    const strBytes = encoder.encode(str);
    const len = strBytes.length;

    const totalSize = OFFSET_SDS_BLOCK_DATA + len + 1;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const sdsU8 = new Uint8Array(arrayBuffer);
    const sdsView = new DataView(arrayBuffer);

    sdsView.setUint32(OFFSET_SDS_BLOCK_LEN, len, true);
    // In Redis implementation alloc is greater than or equal to len, here we set it to len
    sdsView.setUint32(OFFSET_SDS_BLOCK_ALLOC, len, true);

    sdsU8.set(strBytes, OFFSET_SDS_BLOCK_DATA);
    sdsU8[OFFSET_SDS_BLOCK_DATA + len] = 0;

    return sdsU8;
}

export function createRawStringObject(str) {
    const sdsBlock = createSds(str);

    const robjBuffer = new ArrayBuffer(16);
    const robjU8 = new Uint8Array(robjBuffer);
    const view = new DataView(robjBuffer);

    robjU8[OFFSET_TYPE_ENC] = createTypeEncoding(OBJ_STRING, OBJ_ENCODING_RAW);
    view.setInt32(OFFSET_REFCOUNT, 1, true);

    // Pointer referencing the separately allocated SDS block
    robjU8.ptr = sdsBlock;

    return robjU8;
}

export function createStringObject(value) {
    const str = String(value);

    const num = Number(str);
    if (Number.isInteger(num) && !isNaN(str) && str.trim() !== '') {
        // If integer is in shared pool range (0 to 9999), reuse existing object
        if (num >= 0 && num < OBJ_SHARED_INTEGERS && sharedIntegers[num]) {
            incrRefCount(sharedIntegers[num]);
            return sharedIntegers[num];
        }
        return createIntStringObject(num);
    }

    const byteLen = encoder.encode(str).length;

    if (byteLen <= OBJ_ENCODING_EMBSTR_SIZE_LIMIT) {
        return createEmbeddedStringObject(str);
    }

    return createRawStringObject(str);
}

export function getStringValue(robj) {
    if (!robj || !(robj instanceof Uint8Array)) {
        return String(robj);
    }

    const encoding = getObjectEncoding(robj[OFFSET_TYPE_ENC]);

    if (encoding === OBJ_ENCODING_INT) {
        const view = new DataView(robj.buffer, robj.byteOffset, robj.byteLength);
        const intVal = view.getBigInt64(OFFSET_DATA, true);
        return intVal.toString();
    }

    if (encoding === OBJ_ENCODING_EMBSTR) {
        const view = new DataView(robj.buffer, robj.byteOffset, robj.byteLength);
        const len = view.getUint32(OFFSET_SDS_LEN, true);
        const dataBytes = robj.subarray(OFFSET_DATA, OFFSET_DATA + len);
        return decoder.decode(dataBytes);
    }

    if (encoding === OBJ_ENCODING_RAW) {
        const sds = robj.ptr;
        const sdsView = new DataView(sds.buffer, sds.byteOffset, sds.byteLength);
        const len = sdsView.getUint32(OFFSET_SDS_BLOCK_LEN, true);
        const dataBytes = sds.subarray(OFFSET_SDS_BLOCK_DATA, OFFSET_SDS_BLOCK_DATA + len);
        return decoder.decode(dataBytes);
    }

    return null;
}

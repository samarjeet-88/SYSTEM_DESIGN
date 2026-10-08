export const OFFSET_TYPE_ENC = 0;
export const OFFSET_REFCOUNT = 4;
export const OFFSET_PTR = 8;

export const OFFSET_SDS_LEN = 8;
export const OFFSET_SDS_ALLOC = 12;
export const OFFSET_DATA = 16;

export const OFFSET_SDS_BLOCK_LEN = 0;
export const OFFSET_SDS_BLOCK_ALLOC = 4;
export const OFFSET_SDS_BLOCK_DATA = 8;

export const OBJ_STRING = 0;

export const OBJ_ENCODING_RAW = 0;
export const OBJ_ENCODING_INT = 1;
export const OBJ_ENCODING_EMBSTR = 2;

export const OBJ_ENCODING_EMBSTR_SIZE_LIMIT = 44;

export const OBJ_SHARED_INTEGERS = 10000;

export const getObjectType = (typeEncoding) => (typeEncoding >> 4);
export const getEncodingType = (typeEncoding) => (typeEncoding & 0x0f);
export const getObjectEncoding = (typeEncoding) => (typeEncoding & 0x0f);
export const createTypeEncoding = (type, encoding) => ((type << 4) | (encoding & 0x0f));

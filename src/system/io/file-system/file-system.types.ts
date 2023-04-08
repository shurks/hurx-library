/**
 * All the statuses a removing function may return in `FileSystem`.
 */
export type FileSystemRemoveStatus = 'deleted'
    | 'is-directory'
    | 'is-file'
    | 'failed'

/**
 * All the statuses a making function may return in `FileSystem`.
 */
export type FileSystemMakeStatus = 'made'
    | 'failed'

/**
 * An enum containing all supported encoding types.
 */
export enum EncodingType {
    ascii = "ascii",
    base64 = "base64",
    hex = "hex",
    ucs2 = "ucs2",
    utf8 = "utf8",
    binary = "binary"
}
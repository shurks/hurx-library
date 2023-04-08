/**
 * All possible combinations of a series of letters, without
 * using a letter more than once.
 * 
 * @author Stan Hurks
 */
export type UniqueCombinations<All extends string, Used extends string = ''> = ReturnType<() => {
    [Key in All]: Key extends Used
        ? never
        : Key | `${Key}${UniqueCombinations<All, Used | Key>}`
}>[All]

/**
 * Converts an array to union type.
 * 
 * @author Stan Hurks
 */
export type ArrayToUnion<Array extends any[], Processed extends any[] = [], Union extends any = ''> =
    Processed extends Array
    ? Union
    : ArrayToUnion<Array, [...Processed, Array[Processed['length']]], Processed['length'] extends 0 ? Array[Processed['length']] : Union | Array[Processed['length']]>

/**
 * Convert a union to an object
 * 
 * @author Stan Hurks
 */
export type UnionToObject<Union extends keyof any> = {
    [key in Union]: UnionToObject<Exclude<Union, key>>
}


/**
 * A nested object.
 */
export type NestedObject<Value = any> = {
    [property: string]: NestedObject<Value> | {}
}
/**
 * All possible combinations of a series of letters, without
 * using a letter more than once.
 * 
 * @author Stan Hurks
 */
declare type UniqueCombinations<All extends string, Used extends string = ''> = ReturnType<() => {
    [Key in All]: Key extends Used
        ? never
        : Key | `${Key}${UniqueCombinations<All, Used | Key>}`
}>[All]

/**
 * Converts an array to union type.
 * 
 * @author Stan Hurks
 */
declare type ArrayToUnion<Array extends any[], Processed extends any[] = [], Union extends any = ''> =
    Processed extends Array
    ? Union
    : ArrayToUnion<Array, [...Processed, Array[Processed['length']]], Processed['length'] extends 0 ? Array[Processed['length']] : Union | Array[Processed['length']]>

/**
 * Convert a union to an object
 * 
 * @author Stan Hurks
 */
declare type UnionToObject<Union extends keyof any> = {
    [key in Union]: UnionToObject<Exclude<Union, key>>
}

/**
 * A nested object.
 */
declare type NestedObject<Value = any> = {
    [property: string]: NestedObject<Value> | {}
}

/**
 * Merges two objects together
 */
declare type Merge<PrioritizedObject extends {}, OtherObject extends {}, Flags extends 'union-properties'|never = never> = {
    [Key in keyof PrioritizedObject | keyof OtherObject]:
        Key extends keyof PrioritizedObject & keyof OtherObject
            ? Flags extends 'union-properties'
                ? PrioritizedObject[Key] | OtherObject[Key]
                : PrioritizedObject[Key]
            : Key extends keyof PrioritizedObject
                ? PrioritizedObject[Key]
                : Key extends keyof OtherObject
                    ? OtherObject[Key]
                    : never
}
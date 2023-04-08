import Service from "../../../architecture/models/service"
import { service } from "../../../engine/di/di.annotations"

/**
 * Object helper functions.
 * 
 * @author Stan Hurks
 */
@service()
export default class ObjectsService extends Service {
    /**
     * Creates an array with a union type of the given items.
     * 
     * @param items The items
     * @returns The array with type
     */
    public typedArray<T extends string>(...items: T[]): T[] {
        return items
    }
}
import DI from "../../engine/di/di"
import { provide } from "inversify-binding-decorators"

/**
 * The base for a service.
 * @author Stan Hurks
 */
@Service.register()
export default abstract class Service {
    /**
     * An annotation to register a service
     * @returns an annotation function
     */
    public static register<T extends abstract new (...args: never) => Service>() {
        return function(target: T) {
            if (!(target.prototype instanceof Service) && target.prototype !== Service.prototype) {
                throw Error(`${target.name} does not extend the Service base class.`)
            }
            return provide(target)(target)
        }
    }
}
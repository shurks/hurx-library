import { provide } from "inversify-binding-decorators"

/**
 * The interface used by managers
 * @author Stan Hurks
 */
@Manager.register()
export default abstract class Manager {    
    /**
     * Activates the manager
     */
    public activate(...args: any[]): any {
        throw new Error('Not implemented')
    }

    /**
     * An annotation to register a service
     * @returns an annotation function
     */
    public static register<T extends abstract new (...args: never) => Manager>() {
        return function(target: T) {
            if (!(target.prototype instanceof Manager) && target.prototype !== Manager.prototype) {
                throw Error(`${target.name} does not extend the Manager base class.`)
            }
            return provide(target)(target)
        }
    }
}
import Service from "../../architecture/models/service"
import Manager from "../../architecture/models/manager"
import { inject as _inject } from 'inversify'

/**
 * Uses inversify's injectable annotation to register a service
 * @returns the injectable functionality
 */
export function service(): <T extends abstract new (...args: never) => Service>(target: T) => T {
    return Service.register()
}

/**
 * Uses inversify's injectable annotation to register a manager
 * @returns the injectable functionality
 */
export function manager(): <T extends abstract new (...args: never) => Manager>(target: T) => T {
    return Manager.register()
}
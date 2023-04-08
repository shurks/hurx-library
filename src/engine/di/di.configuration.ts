import Service from "../../architecture/models/service"
import Manager from "../../architecture/models/manager"
import DI from "./di"

/**
 * The configuration data for dependency injection.
 * @author Stan Hurks
 */
export default class DIConfiguration {
    /**
     * The DI
     */
    private di: DI|null = null

    /**
     * All entities connected to the DI
     */
    public entities: {
        services: Service[],
        managers: Manager[]
    } = {
        services: [],
        managers: []
    }

    /**
     * Acitvate the DI configuration
     * @param di the DI instance
     */
    public activate(di: DI|null) {
        this.di = di
    }

    /**
     * Deactivates the DI configuration
     */
    public deactivate() {
        this.di = null
    }

    /**
     * Adds a service
     * @param service the service
     */
    public addService(service: Service) {
        if (this.di === null) return
        // this.di.container.bind(Symbol.for((service as any).name)).to(service as any)
    }

    /**
     * Adds a manager
     * @param manager the manager 
     */
    public addManager(manager: Manager) {
        if (this.di === null) return
    }
}
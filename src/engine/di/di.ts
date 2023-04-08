import 'fs'
import { Container } from "inversify"
import { buildProviderModule } from 'inversify-binding-decorators'

/**
 * All functionality for dependency injection.
 * @author Stan Hurks
 */
export default class DI {
    /**
     * The running instance
     */
    private static instance: DI|null = null

    /**
     * The inversify DI container
     */
    public readonly container: Container

    /**
     * Construct a DI instance
     * @param platform the platform the program is running on
     */
    private constructor() {
        this.container = new Container()
        this.container.load(buildProviderModule())
    }

    /**
     * Start the DI functionality
     */
    public static createInstance(): DI {
        if (DI.instance !== null) {
            throw Error(`DI is already running`)
        }
        DI.instance = new DI()
        return DI.instance
    }
}
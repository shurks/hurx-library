import DI from "./di/di"

/**
 * The engine running the program
 * @author Stan Hurks
 */
export default class Engine {
    /**
     * The running instance
     */
    private static instance: Engine | null = null

    /**
     * Dependency injection
     */
    public di: DI

    private constructor() {
        this.di = DI.createInstance()
    }

    /**
     * Run the program for node
     */
    public static createInstance(): Engine {
        if (Engine.instance !== null) {
            throw Error('Engine is already running')
        }
        Engine.instance = new Engine()
        return Engine.instance
    }
}

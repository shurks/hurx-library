import { RegexModule } from "./regex.module"
import { service } from "../../../engine/di/di.annotations"
import Service from "../../../architecture/models/service"

/**
 * The service for regex
 */
@service()
export default abstract class RegexService extends Service {
    /**
     * Start the regex builder by adding an alias
     * @param name the name
     * @param regex the regex
     */
    alias = RegexModule.alias

    /**
     * Starts the regex builder by making captures.
     */
    capture = RegexModule.capture
}
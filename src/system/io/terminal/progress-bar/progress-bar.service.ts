import colors from 'ansi-colors'
import progress from 'cli-progress'
import LoggerService from '../../logger/logger.service'
import { inject } from 'inversify'
import { service } from '../../../../engine/di/di.annotations'
import Service from '../../../../architecture/models/service'

/**
 * Functionality for adding a progress bar to the terminal.
 * @author Stan Hurks
 */
@service()
export default class ProgressBarService extends Service {
    @inject(LoggerService) private readonly logger!: LoggerService

    /**
     * The current progress bar
     */
    private bar: progress.SingleBar | null = null

    /**
     * Starts the progress bar in the terminal
     * @param data options for initialization
     */
    public start(data: {
        title: string
        unit: 'Files'
        total: number
        startValue?: number
    }) {
        const { title, unit } = data
        this.bar = new progress.SingleBar({
            format: title + ' |' + colors.bgGreen('{bar}') + '| {percentage}% || {value}/{total} ' + unit + ' ',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591'
        }, progress.Presets.shades_grey)
        this.bar.start(data.total, data.startValue || 0)
    }

    /**
     * Updates the progress bar
     * @param data options for updating
     */
    public update(data: {
        current: number,
        payload?: object
    }) {
        if (this.bar) {
            this.bar.update(data.current, data.payload)
        }
        else {
            this.logger.warning(`Couldn't update progress bar, there is none active.`)
        }
    }

    /**
     * Stops the progress bar
     */
    public stop() {
        if (this.bar) {
            this.bar.stop()
            this.bar = null
        }
        else {
            this.logger.warning(`Couldn't stop progress bar, there is none active.`)
        }
    }
}
import Color from "../../theme/color"
import chalk from 'chalk'

/**
 * The types of logger messages
 */
export type LoggerMessageTypes = 'info' | 'warn' | 'success' | 'error' | 'trace' | 'debug' | 'verbose'

/**
 * The interface for logger services.
 * @author Stan Hurks
 */
export default class Logger {
    /**
     * Colors
     */
    protected colors: Record<string, string> = {
        trace: '#1CFFA3',
        info: '#24A3FE',
        debug: '#E7FF48',
        verbose: '#FF601C',
        warn: '#FED424',
        error: '#FF3F66',
        success: '#8CFE4B'
    }

    /**
     * The amount of indents per level
     */
    protected indentsPerLevel: number = 4

    /**
     * Prints a message for the clients to see, except if the type
     * provided is verbose, debug or trace.
     * @param options the options
     * @param data any data
     */
    public label(type: LoggerMessageTypes, label: string, ...data: any[]) {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors[type])(` ${label.substring(0, 1).toUpperCase()}${label.substring(1)} `) + chalk.bgHex(this.colors[type]).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: type, label: label }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a warning message for the clients to see
     * @param data any data
     */
    public success(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.success)(` Success `) + chalk.bgHex(this.colors.success).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'success' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a warning message for the clients to see
     * @param data any data
     */
    public warn(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.warn)(` Warn `) + chalk.bgHex(this.colors.warn).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'warn' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints an error message for the clients to see
     * TODO: prettify
     * @param data any data
     */
    public error(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.error)(` Error `) + chalk.bgHex(this.colors.error).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'error' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a message for the clients to see
     * @param data any data
     */
    public info(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.info)(` Info `) + chalk.bgHex(this.colors.info).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'info' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a message when the --verbose, --debug or --trace flag is present,
     * this is the lowest level of debug information.
     * @param data any data
     */
    public trace(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.trace)(` Trace `) + chalk.bgHex(this.colors.trace).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'trace' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a message when the --verbose or --debug flag is present,
     * this is the default level of debug information.
     * @param data any data
     */
    public debug(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.debug)(` Debug `) + chalk.bgHex(this.colors.debug).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'debug' }, ...data.map((v) => convert(v)))
    }

    /**
     * Prints a message when the --verbose flag is present,
     * this is the highest level of debug information.
     * @param data any data
     */
    public verbose(...data: any[]): void {
        const convert = (d: any) => typeof d === 'string'
            ? chalk.bgHex('#222222').hex(this.colors.verbose)(` Verbose `) + chalk.bgHex(this.colors.verbose).bold.hex('#222222')(` ${d} `)
            : d
        this.perform({ type: 'verbose' }, ...data.map((v) => convert(v)))
    }

    /**
     * Performs printing the log message
     * @param options options
     * @param data the data
     * @returns 
     */
    protected perform(options: { type: LoggerMessageTypes, label?: string }, ...data: any[]): void {
        let {
            type,
            label
        } = options
        const flags = {
            verbose: ['--verbose'],
            debug: ['--verbose', '--debug'],
            trace: ['--verbose', '--debug', '--trace'],
            info: [] as string[],
            warn: [] as string[],
            error: [] as string[],
            success: [] as string[]
        }[type]
        if (flags.length && !process.argv.find((v) => flags.includes(v))) {
            return
        }
        for (const d of data) {
            if (typeof d === 'string' || typeof d === 'boolean' || typeof d === 'number' || typeof d === 'bigint' || typeof d === 'function' || typeof d === 'symbol' || typeof d === 'undefined') {
                console.log(`${d}`)
            }
            else {
                this.logObject(0, d, type, label)
            }
        }
    }

    /**
     * Get the color based on the indentation level, based on the current
     * node and it will be increased based on the amount of indentations
     * at the beginning of `string`.
     *  
     * @param string the string to check the amount of spaces in (optional)
     * @returns the shifted color in hue
     */
    public getColor = (string: string = '') => {
        let match = string.match(/^\s*/)
        let level = 0
        if (match) {
            level += match[0].length / this.indentsPerLevel
        }
        return this.getColorForLevel(level)
    }

    /**
     * Get the color based on the indentation level.
     *  
     * @param string the string to check the amount of spaces in (optional)
     * @returns the shifted color in hue
     */
    public getColorForLevel = (level: number) => {
        return Color.changeHue('#BA5BFF', level * 12)
    }

    /**
     * Formats and logs an object
     * @param level the level of indentation the object should start at
     * @param object the object or array
     * @param type the type of level the message is for
     */
    public logObject = (level: number, object: any, type: LoggerMessageTypes, label?: string) => {
        // TODO: upgrade that circular works properly,
        // if a node has a .parent, dont remove the .children from the node
        const getCircularReplacer = () => {
            const seen = new WeakSet()
            return (key: any, value: any) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return "circular"
                    }
                    seen.add(value)
                }
                return value
            }
        }
        JSON.stringify(object, getCircularReplacer(), this.indentsPerLevel).replace(/^/, '\n').split('\n').forEach((v, i) => {
            // Get the level of the current line
            const color = this.getColor(v)

            // Insert indentation based on level and json indents
            let objectLevel = 0
            let match = v.match(/^\s*(?=[0-9]|true|false|null|\"|\}|\{|\[|\])/)
            if (match) {
                objectLevel += Math.floor(match[0].length / this.indentsPerLevel)
            }

            objectLevel += level
            v = new Array(level).fill(new Array(this.indentsPerLevel).fill(' ').join('')).join('') + v
            v = v.replace(/^\s*(?=[0-9]|true|false|null|\"|\}|\{|\[|\])/, new Array(objectLevel).fill(objectLevel).map((v, i) => new Array(this.indentsPerLevel).fill('').map((v, j) => chalk.hex(this.getColorForLevel(i + (j / this.indentsPerLevel)))('.')).join('')).join(''))

            // Log the type
            if (i === 0) {
                console.log(new Array(objectLevel).fill('').map((v, i) => new Array(this.indentsPerLevel).fill('').map((v, j) => chalk.hex(this.getColorForLevel(i + j / this.indentsPerLevel))('.')).join('')).join('') + chalk.bgHex('#222222').hex(this.colors[type])(` ${(label || type).substring(0, 1).toUpperCase() + (label || type).substring(1)} `) + chalk.hex('#222222').bold.bgHex(this.colors[type])(` ${typeof object} `))
                return
            }

            // Replace quotes
            match = v.match(/\".*\"(?=\:)/)
            if (match) {
                v = v.replace(match[0], chalk.bgHex(color).bold.hex('#333333')(match[0].replace(/^\"/, ' ').replace(/\"$/, ' ')))
            }

            // Replace brackets
            v = v.replace(/(\{(?=\,|\}))|(\{)$/, chalk.hex(color)('{'))
            v = v.replace(/(\}(?=\,))|(\})$/, chalk.hex(color)('}'))
            v = v.replace(/(\[(?=\,|\]))|(\[)$/, chalk.hex(color)('['))
            v = v.replace(/(\](?=\,))|(\])$/, chalk.hex(color)(']'))

            // Replace booleans
            v = v.replace(/true((?=\,)|$)/g, chalk.hex('#FF488E')('true'))
            v = v.replace(/null((?=\,)|$)/g, chalk.hex('#FF488E')('null'))
            v = v.replace(/false((?=\,)|$)/g, chalk.hex('#FF488E')('false'))

            // Replace strings
            match = v.match(/(((?<=\:) )|((\u001b\[0-9;]*[A-Za-z])|(\s|.))*)\".+\"((?=\,)|$)/)
            if (match) {
                v = v.replace(match[0], chalk.hex('#74CDFF')(match[0]))
            }

            // Replace numbers
            match = v.match(/(?<=((\u001b\[0-9;]*[A-Za-z])|\s)*)(\-)?[0-9]+(\.[0-9]+)?((?=\,)|$)/)
            if (match) {
                v = v.substring(0, match.index || 0) + chalk.hex('#FFEE7E')(match[0]) + v.substring((match.index || 0) + match[0].length)
            }

            // Replace commas
            v = v.replace(/\,$/, chalk.hex('#333333')(''))
            v = v.replace(/(?<=((\u001b\[0-9;]*[A-Za-z])|\")*)\:/g, chalk.hex('#333333')(''))

            console.log(v)
        })
    }
}
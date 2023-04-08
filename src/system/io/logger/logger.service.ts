import chalk from "chalk"
import { LoggerPrefixType } from "./logger.types"
import RegexService from "../../types/regex/regex.service"
import { inject } from "inversify"
import Service from "../../../architecture/models/service"
import { service } from "../../../engine/di/di.annotations"

/**
 * The interface for logger services.
 * @author Stan Hurks
 */
@service()
export default class LoggerService extends Service {
    @inject(RegexService) protected readonly regex!: RegexService

    /**
     * The chalks used by the logger implementations
     */
    protected chalks = {
        type: {
            info: chalk.bgHex('#003D27').white.bold,
            log: chalk.bgHex('#00068C').white.bold,
            data: chalk.bgHex('#3F007E').white.bold,
            warning: chalk.bgHex('#FF6D1C').white.bold,
            error: chalk.bgHex('#FF0944').black.bold,
            throw: chalk.bgHex('#FF0944').black.bold
        },
        path: {
            info: chalk.bgHex('#006541').white.bold,
            log: chalk.bgHex('#0008BF').white.bold,
            data: chalk.bgHex('#5200A5').white.bold,
            warning: chalk.bgHex('#FF8A48').white.bold,
            error: chalk.bgHex('#FF3465').black.bold,
            throw: chalk.bgHex('#FF3465').black.bold
        },
        position: {
            info: chalk.bgHex('#008656').white.bold,
            log: chalk.bgHex('#0009EA').white.bold,
            data: chalk.bgHex('#6700CE').white.bold,
            warning: chalk.bgHex('#FFA674').white.bold,
            error: chalk.bgHex('#FF5A82').black.bold,
            throw: chalk.bgHex('#FF5A82').black.bold
        },
        error: {
            message: chalk.bgHex('#000000').white.bold,
            semi: chalk.hidden,
            path: chalk.bgHex('#4700A1').white.bold,
            function: chalk.bgHex('#000000').white.bold,
            lineAndCharacter: chalk.bgHex('#333333').white.italic,
            other: chalk.bgHex('#333333').white.italic
        }
    }
    
    /**
     * Used for logging the start of a certain information logs about the programs status
     */
    public info(...data: any) {
        this.perform('info', ...data)
    }

    /**
     * Used for logging the statuses inbetween
     */
    public log(...data: any) {
        this.perform('log', ...data)
    }

    /**
     * Used for logging data
     */
    public data(...data: any) {
        this.perform('data', ...data)
    }
    
    /**
     * Used for logging warnings about the program
     */
    public warning(...data: any) {
        this.perform('warning', ...data)
    }

    /**
     * Used for logging errors about the program
     */
    public error(error: Error|string) {
        this.perform('error', error)
    }

    /**
     * Generates a styled error to throw in the console
     */
    public throw(error: string): Error {
        return new Error(this.prefix('error') + error)
    }

    /**
     * Performs a log
     * @param type the type of log
     * @param data the arguments passed as data
     */
    public perform(type: LoggerPrefixType, ...data: any) {
        switch (type) {
            case 'warning':
            case 'log':
            case 'info':
            case 'data': {
                console[type === 'warning' ? 'warn' : type === 'data' ? 'debug' : type](this.prefix(type), ...data)
                break
            }
            case 'error': {
                if (data && data instanceof Error) {
                    if (data.message && data.message.length) {
                        console.error(this.prefix(type) + data.message)
                    }
                    else {
                        console.error(this.prefix(type), data)
                    }
                }
                else if (typeof data === 'string') {
                    console.error(this.prefix(type) + data)
                }
                else {
                    console.error(this.prefix(type), data)
                }
                break
            }
        }
    }

        /**
     * The prefix for all logs
     */
    protected prefix(type: LoggerPrefixType, chalks = this.chalks): string {
        const stack = (new Error()).stack
        if (stack) {
            const captures = this.generateCapturesFromStack(stack)
            const capture = captures.find((v) => !__filename.replace(/\\/g, '/').endsWith(v.path.replace(/\\/g, '/'))) || captures[0]
            if (capture) {
                const value = `${chalks.type[type](` ${type.substring(0, 1)}${type.substring(1)} `)}${chalks.path[type](` ${capture.path.split('\\').join('/')} `)}${chalks.position[type](` ${capture.line}:${capture.character} `)} `
                if (type === 'data') {
                    return value + '\n'
                }
                else if (type === 'error') {
                    return value.trimEnd()
                }
                return value
            }
        }
        return ''
    }

    /**
     * Generates an array of captures from an error stack.
     */
    protected generateCapturesFromStack = (stack: string) => this.regex
        // The aliases to build the capture groups
        .alias('Whitespace', /[\t\n \s]/)
        .alias('First character in function name', /[a-zA-Z$_.]/)
        .alias('Remaining characters in function name', _ => _('First character in function name').or(/[0-9]/))
        .alias('Function name', _ => _(/<?/, 'First character in function name', 'Remaining characters in function name*', />?/))
        .alias('Stack first function segments', _ => 
            _('Function name', /\./))
        .alias('Path separator', /(\/|\\)+/)
        .alias('Path name', /[^<>:;,?"*/]+/)
        .alias('Path directory', (_, helpers) => _(helpers.lookbehind('Path separator'), 'Path name', helpers.negativeLookahead(/\./)))
        .alias('Path file', (_, helpers) => _(helpers.lookbehind('Path separator'), 'Path name', _(/\./, /[a-zA-Z0-9]+/).optional()))
        .alias('Path os', _ => _(/([a-zA-Z]\:)?/))
        .alias('Path node', _ => _(/([a-zA-Z]+\:)/))
        
        // The variables to be used as keys in the capture groups object
        .alias('function', (_, helpers) => _(
            helpers.lookbehind('Whitespace+', /at/, 'Whitespace+'),
            'Stack first function segments+',
            'Function name',
            /(\s\[as \.[a-zA-Z]+\])?/,
            helpers.lookahead('Whitespace*', /\(/)))
        .alias('pathPrefix', (_, helpers) => _(
            helpers.lookbehind('Whitespace', /\(/),
            _(
                'Path os', 'Path separator', _('Path directory', 'Path separator').quantifier('*'), /src/, 'Path separator'
            ).or(
                'Path node', _('Path name', 'Path separator').quantifier('*')
            )
        ))
        .alias('path', 'Path file')
        .alias('line', (_, helpers) => _(helpers.lookbehind(/:/), /[0-9]+/, helpers.lookahead(/:/)))
        .alias('semi', /:/)
        .alias('character', (_, helpers) => _(helpers.lookbehind(/:/), /[0-9]+/, helpers.lookahead(/\)/)))
        
        // Take the captures
        .capture(stack, 'function', 'pathPrefix', 'path', 'line', 'semi', 'character')

    /**
     * Compiles an error into a styled stack trace
     * @param error the error to print the stack trace for
     */
    protected styledStackTrace(error: Error|string): string {
        return typeof error === 'string'
            ? this.chalks.error.message(' ' + error + ' ')
            : (error.message ? this.chalks.error.message(' ' + error.message + ' ') : '')
                + (() => {
                    if (error.stack) {
                        let message: string = ''
                        const captures = this.generateCapturesFromStack(error.message.length ? error.stack.substring(error.stack.indexOf(error.message) + error.message.length) : error.stack)
                        for (const capture of captures) {
                            for (const name of Object.keys(capture) as Array<keyof typeof capture>) {
                                const group = capture[name]
                                const format = name === 'semi'
                                    ? this.chalks.error.semi
                                    : name === 'path'
                                        ? this.chalks.error.path
                                        : name === 'function'
                                            ? this.chalks.error.function
                                            : ['line', 'character'].includes(name)
                                                ? this.chalks.error.lineAndCharacter
                                                : this.chalks.error.other
                                message += format(group)
                            }
                        }
                        return message
                    }
                    else {
                        return ''
                    }
                })()
    }
}
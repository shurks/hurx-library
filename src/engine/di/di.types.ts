/**
 * Define symbols for all services
 */
export const services = {
    // IO
    fileSystem: Symbol.for('FileSystemService'),
    logger: Symbol.for('LoggerService'),
    progressBar: Symbol.for('ProgressBarService'),

    // Types
    objects: Symbol.for('ObjectsService'),
    regex: Symbol.for('RegexService'),
}

/**
 * Define symbols for all managers
 */
export const managers = {
    manager: Symbol.for('Manager'),

    // Intellisense
    autocompleteManager: Symbol.for('AutoCompleteManager'),
    hoverManager: Symbol.for('HoverManager'),

    // Platform
    platformManager: Symbol.for('PlatformManager'),
    clientManager: Symbol.for('ClientManager'),
    nodeManager: Symbol.for('NodeManager'),
    serverManager: Symbol.for('ServerManager'),

    // Text mate
    textMateManager: Symbol.for('TextMateManager'),
    textMateSyntaxManager: Symbol.for('TextMateSyntaxManager')
}
import fs from 'fs'
import path from 'path'
import { EncodingType, FileSystemMakeStatus, FileSystemRemoveStatus } from './file-system.types'
import LoggerService from '../logger/logger'
import ProgressBarService from '../terminal/progress-bar/progress-bar.service'
import { inject } from 'inversify'
import { service } from '../../../engine/di/di.annotations'
import Service from '../../../architecture/models/service'

/**
 * The service for the file system functionality.
 * @author Stan Hurks
 */
@service()
export default class FileSystemService extends Service {
    @inject(LoggerService) private readonly logger!: LoggerService
    @inject(ProgressBarService) private readonly progress!: ProgressBarService

    /**
     * Removes a file or directory at a given path
     * 
     * @param resourcePath The path of the resource
     * @param recursions The amount of times this function has been recursed
     * @param lastRecursionStatus The status of the last recursion
     * @param maxRecursions The maximum amount of recursions allowed
     * @returns The status ('deleted' | 'failed')
     */
    public remove(
        resourcePath: string,
        recursions: number = 0,
        lastRecursionStatus: FileSystemRemoveStatus | null = null,
        maxRecursions = 30
    ): FileSystemRemoveStatus {

        // Check if the function has been recursed too many times
        if (recursions > maxRecursions) {
            throw Error(`FileSystem.remove() has recursed itself over ${maxRecursions} times, perhaps something is wrong with your code. Status: ${lastRecursionStatus}.`)
        }

        // Check if path exists
        if (!fs.existsSync(resourcePath)) {
            return 'deleted'
        }

        // Delete directory
        if (fs.lstatSync(resourcePath).isDirectory()) {
            const status = this.removeDirectory(resourcePath)
            switch (status) {
                case 'deleted':
                    return status
                default:
                    return this.remove(resourcePath, recursions + 1, status)
            }
        }

        // Delete file
        else {
            const status = this.removeFile(resourcePath)
            switch (status) {
                case 'deleted':
                    return status
                default:
                    return this.remove(resourcePath, recursions + 1, status)
            }
        }
    }

    /**
     * Removes a directory at a path
     * @param resourcePath the path
     * @returns The status ('deleted'|'is-file'|'failed')
     */
    private removeDirectory(resourcePath: string): FileSystemRemoveStatus {

        // Check if path exists
        if (!fs.existsSync(resourcePath)) {
            return 'deleted'
        }

        // Check if path is directory
        if (!fs.lstatSync(resourcePath).isDirectory()) {
            return 'is-file'
        }

        let files: string[] = []
        try {
            // Delete all the files
            files = fs.readdirSync(resourcePath)
            for (let file of files) {
                this.remove(path.join(resourcePath, file))
            }

            // Delete the directory itself
            fs.rmdirSync(resourcePath)
        }
        catch (error) {
            this.logger.error(`Could not remove directory: ${error}`)

            if (!fs.existsSync(resourcePath)) {
                return 'deleted'
            }
            else {
                return 'failed'
            }
        }

        // Done
        return 'deleted'
    }

    /**
     * Removes a file at a path
     * @param resourcePath the path
     * @returns the status ('deleted'|'is-directory'|'failed')
     */
    private removeFile(resourcePath: string): FileSystemRemoveStatus {
        // Check if path exists
        if (!fs.existsSync(resourcePath)) {
            return 'deleted'
        }

        // Check if path is directory
        if (fs.lstatSync(resourcePath).isDirectory()) {
            return 'is-directory'
        }

        // Remove the file
        try {
            if (fs.rmSync) {
                fs.rmSync(resourcePath)
            }
            else {
                fs.unlinkSync(resourcePath)
            }
        }
        catch (error) {
            this.logger.error(`Could not remove file: ${error}`)

            if (!fs.existsSync(resourcePath)) {
                return 'deleted'
            }
            else {
                return 'failed'
            }
        }

        // Done
        return 'deleted'
    }

    /**
     * Make a directory
     * 
     * @param directoryPath The directory path
     * @returns The status ('made' | 'failed')
     */
    public makeDirectory(directoryPath: string): FileSystemMakeStatus {
        const pathParts = directoryPath.split(/\/|\\/g).filter((v) => v.trim().length)

        // An empty path was given
        if (!pathParts.length) {
            this.logger.error(`Could not make directory, an empty path was given: "${directoryPath}".`)
            return 'failed'
        }

        let currentPath: string = ''
        for (let pathPart of pathParts) {

            // Append to the current path
            currentPath = path.join(currentPath, pathPart)

            // The path exists
            if (fs.existsSync(currentPath)) {

                // The path is a directory
                if (fs.lstatSync(currentPath).isDirectory()) {
                    continue
                }

                // The path is a file
                else {
                    this.logger.error(`Could not create directory at path "${directoryPath}", because path "${currentPath}" is a file.`)
                    return 'failed'
                }
            }

            // The path doesn't exist
            else {
                try {
                    fs.mkdirSync(currentPath)
                }
                catch (error) {
                    if (fs.existsSync(currentPath) && fs.lstatSync(currentPath).isDirectory()) {
                        continue
                    }
                    else {
                        this.logger.error(`Could not create directory at path "${directoryPath}", because an error occurs when creating a directory at path "${currentPath}": ${error}`)
                        return 'failed'
                    }
                }
            }
        }

        // We're done.
        return fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory()
            ? 'made'
            : 'failed'
    }

    /**
     * Make a file
     * 
     * @param filePath The path to the file
     * @param data The data of the file
     * @param encoding The encoding of the content (default: utf8)
     * @returns The status ('made' | 'failed')
     */
    public makeFile(filePath: string, data: string | Buffer, encoding: EncodingType = EncodingType.utf8): FileSystemMakeStatus {
        const filePathParts = filePath.split(/\/|\\/g).filter((v) => v.trim().length)

        // An empty path was given
        if (!filePathParts.length) {
            this.logger.error(`Could not make file, an empty path was given.`)
            return 'failed'
        }

        // Create the directory if it doesn't exist
        const directoryPath = filePathParts
            .filter((v, i) => i !== filePathParts.length - 1)
            .join(path.sep)

        // Failed to make directory
        if (this.makeDirectory(directoryPath) === 'failed') {
            this.logger.error(`Failed to create directory: "${directoryPath}".`)
            return 'failed'
        }

        // Directory is made
        else {

            // Delete file
            if (fs.existsSync(filePath)) {

                // Failed to remove file
                if (this.remove(filePath) === 'failed') {
                    this.logger.error(`Failed to remove file: "${filePath}".`)
                    return 'failed'
                }
            }

            // Make file
            try {
                fs.writeFileSync(filePath, data)

                return fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()
                    ? 'made'
                    : 'failed'
            }
            catch (error) {
                this.logger.error(`Could not write to file: "${filePath}": ${error}`)
                return 'failed'
            }
        }
    }

    /**
     * Read a file, this currently only supports "utf8".
     * 
     * @param filePath The file path
     * @returns The files content
     */
    public readFile(filePath: string, encoding: EncodingType = EncodingType.utf8): string | null {
        // The file doesn't exist or is a directory
        if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
            this.logger.error(`Could not read file "${filePath}", it doesn't exist or is a directory.`)
            return null
        }

        // The file exists
        else {
            try {
                return fs.readFileSync(filePath, {
                    encoding
                })
            }
            catch (error) {
                this.logger.error(`Could not read file, error: ${error}`)
                return null
            }
        }
    }

    /**
     * Copies the `destinationDirectory` and its contents to the `destinationDirectory` path.
     * 
     * This will override all the files too if the creation date is more recent in the `originalDirectory`.
     */
    public copyDirectory(originalDirectory: string, destinationDirectory: string): boolean {       
        const originalFiles = this.listFilePathsInDirectory(originalDirectory, null, true)
        const destinationFiles = this.listFilePathsInDirectory(destinationDirectory, null, true)
        if (originalFiles === 'failed') {
            this.logger.error(`Original directory does not exist: ${originalDirectory}`)
            return false
        }
        else if (destinationFiles === 'failed' && this.makeDirectory(destinationDirectory) === 'failed') {
            this.logger.error(`Destination directory does not exist and can not be made.`)
        }

        this.logger.log('Destination directory does not exist')
        this.logger.info('Copying original directory to destination path')
        this.progress.start({
            title: 'Copying directory',
            unit: 'Files',
            total: originalFiles.length,
            startValue: 0
        })
        for (let i = 0 ; i < originalFiles.length; i++) {
            const file = originalFiles[i]

            const destinationPath = path.join(destinationDirectory, file.path.replace(originalDirectory, ''))
            const data = this.readFile(file.path)
            if (data === null) {
                this.progress.stop()
                this.logger.error(`Couldn't find file: ${file.path}`)
                return false
            }
            else {
                const status = this.makeFile(destinationPath, data)
                if (status === 'failed') {
                    this.progress.stop()
                    this.logger.error(`Failed to overwrite file: ${destinationPath}`)
                    return false
                }
                else {
                    this.progress.update({
                        current: i + 1
                    })
                }
            }
        }
        this.progress.stop()
        return true
    }

    /**
     * Copies a file
     * 
     * @param filePath The path to the file
     * @param destinationPath The path to the destination
     * @returns The status ('made' | 'failed')
     */
    public copyFile(filePath: string, destinationPath: string): FileSystemMakeStatus {

        // The file doesn't exist.
        if (!fs.existsSync(filePath)) {
            this.logger.error(`Could not copy file, it doesn't exist: ${filePath}`)
            return 'failed'
        }

        // The file is a directory
        if (fs.lstatSync(filePath).isDirectory()) {
            this.logger.error(`Could not copy file, it is a directory: ${filePath}`)
            return 'failed'
        }

        const data = this.readFile(filePath)
        if (data === null) {
            this.logger.error(`Could not read file: ${filePath}`)
            return 'failed'
        }

        if (this.makeFile(destinationPath, data) === 'failed') {
            this.logger.error(`Could not make file at destination: "${destinationPath}"`)
            return 'failed'
        }

        return 'made'
    }

    /**
     * Lists all file paths in a directory.
     * 
     * @param directoryPath The path of the directory
     * @param extension The extension of the file, e.g.: "js"
     * @param recurse Whether to recurse into subdirectories.
     * @returns All files in the directory or 'failed' if the directory doesn't exist
     */
    public listFilePathsInDirectory(
        directoryPath: string,
        extension: string | null = null,
        recurse: boolean = false
    ): { path: string, modified: number }[] | 'failed' {

        // All file paths
        let files: { path: string, modified: number }[] = []

        // The directory doesn't exist
        if (!fs.existsSync(directoryPath)) {
            return 'failed'
        }

        // The directory exists
        else {
            try {
                for (const resource of fs.readdirSync(directoryPath)) {
                    const resourcePath = path.join(directoryPath, resource)

                    // Resource doesn't exist anymore
                    if (!fs.existsSync(resourcePath)) {
                        this.logger.error(`Resource "${resourcePath}" does not exist anymore, skipping.`)
                        continue
                    }

                    // Resource exists
                    else {
                        // Directory
                        const stats = fs.lstatSync(resourcePath)
                        if (stats.isDirectory()) {

                            // Recurse
                            if (recurse) {
                                const response = this.listFilePathsInDirectory(resourcePath, extension, recurse)
                                if (response === 'failed') {
                                    return 'failed'
                                }
                                else {
                                    files = files.concat(response)
                                }
                            }
                        }

                        // File
                        else if (extension === null || (resourcePath.toLowerCase().endsWith(extension.toLowerCase()))) {
                            files.push({
                                path: resourcePath,
                                modified: stats.mtimeMs
                            })
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error(`Could not list files in directory: "${directoryPath}", error: ${error}`)
                return 'failed'
            }
        }

        return files
    }
}
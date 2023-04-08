import fs from 'fs'
import path from 'path'

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.
(() => {
    const source = fs.readFileSync(path.resolve('./package.json')).toString('utf-8')
    const sourceObj = JSON.parse(source)
    sourceObj.scripts = {}
    sourceObj.devDependencies = {}
    if (sourceObj.main && sourceObj.main.startsWith("dist/")) {
        sourceObj.main = sourceObj.main.slice(5)
    }
    if (sourceObj.types && sourceObj.types.startsWith("dist/")) {
        sourceObj.types = sourceObj.types.slice(5)
    }
    if (fs.existsSync(path.resolve('./.npmignore'))) {
        fs.copyFileSync(path.resolve('./.npmignore'), path.resolve('./dist', '.npmignore'))
    }
    fs.writeFileSync(path.resolve('./dist', 'package.json'), Buffer.from(JSON.stringify(sourceObj, null, 4), "utf-8"))
    fs.writeFileSync(path.resolve('./dist', 'version.txt'), Buffer.from(sourceObj.version, "utf-8"))
})()
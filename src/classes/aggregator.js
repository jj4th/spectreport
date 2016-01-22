const fs = require('fs-extra');
const path = require('path');

import Suite from './suite';

class Aggregator {
    constructor(jsonDir, suiteTitle) {
        this.jsonDir = jsonDir;
        this.results = new Suite({title: suiteTitle});
        this.lookupKeyPaths = {};
    }

    // List all files in a directory in Node.js recursively in a synchronous fashion
    listFiles(jsonDir, fileList) {
        jsonDir = jsonDir || this.jsonDir;
        fileList = fileList || [];

        let files = fs.readdirSync(jsonDir);

        for(let file of files) {
            file = path.join(jsonDir, file);
            if (fs.statSync(file).isDirectory()) {
                fileList = this.listFiles(file, fileList);
            } else if (file.indexOf('.json') > 0) {
                fileList.push(file);
            }
        }

        return fileList;
    }

    addJsonObject(keyPath, jsonObj) {
        let lookup = this.lookupKeyPaths,
            suite = Suite.fromObject(jsonObj),
            cursor = suite,
            parent;

        while (keyPath.length) {
            parent = lookup[keyPath.join('|')];

            if (!parent) {
                let key = keyPath[keyPath.length - 1];
                parent = new Suite({title: key});
                lookup[keyPath.join('|')] = parent;
            }

            if (cursor.parent !== parent) {
                cursor.parent = parent;
                parent.addSuite(cursor);
            } else {
                parent.addStats(suite.stats);
            }

            parent.fixTimeStats();
            cursor = parent;
            keyPath.pop();
        }

        parent = this.results;
        if (cursor.parent !== parent) {
            cursor.parent = parent;
            parent.addSuite(cursor);
        } else {
            parent.addStats(suite.stats);
        }
        parent.fixTimeStats();
    }

    addJsonFileList(fileList) {
        for (let file of fileList) {
            let dir = path.relative(this.jsonDir, path.dirname(file));
            let keyPath = dir.split(path.sep);
            let jsonObj = null;

            // Delete empty keyPath, occurs for top level tests.
            if (keyPath[0] === '') {
                keyPath.shift();
            }

            try {
                jsonObj = fs.readJsonSync(file);
                this.addJsonObject(keyPath, jsonObj);
            } catch (ex) {
                throw new Error('There was a problem reading a results file: ' + file + '.\n' + ex.message);
            }
        }
    }

    scan() {
        let fileList = null;

        try {
            fileList = this.listFiles();
        } catch (ex) {
            throw new Error('There was a problem reading the results directory.\n' + ex.message);
        }

        this.addJsonFileList(fileList);
        return this.results;
    }
}

export default Aggregator;

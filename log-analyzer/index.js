const fs = require('fs').promises;
const path = require('path');
const Logger = require('logger-module');

const logger = new Logger();
const LOGS_DIR = path.join(__dirname, '..', 'logs');

const logRegex = /\[.*?\] \[(\w+)\]/;

function showHelp() {
    logger.info('Log Analyzer Usage:');
    console.log('\n  node index.js [options]\n');
    console.log('Options:');
    console.log('  --type <string>   Filter by log type (e.g., SUCCESS, ERROR, INFO)');
    console.log('  --help            Show this help message');
}

async function analyzeLogs(filterType) {
    logger.info(`Starting analysis of logs in: ${LOGS_DIR}`);
    if (filterType) {
        filterType = filterType.toUpperCase();
        logger.info(`Filtering for log type: ${filterType}`);
    }

    let logCounts = {};
    let totalFiles = 0;
    let totalLines = 0;

    try {
        const minuteFolders = await fs.readdir(LOGS_DIR);

        for (const folder of minuteFolders) {
            const folderPath = path.join(LOGS_DIR, folder);

            try {
                const stats = await fs.stat(folderPath);
                if (!stats.isDirectory()) continue;
            } catch (statErr) {
                logger.warn(`Could not stat ${folderPath}, skipping.`, statErr.message);
                continue;
            }

            let logFiles = [];
            try {
                logFiles = await fs.readdir(folderPath);
            } catch (dirErr) {
                logger.error(`Could not read directory ${folderPath}, skipping.`, dirErr.message);
                continue;
            }

            for (const file of logFiles) {
                if (!file.endsWith('.log')) continue;

                const filePath = path.join(folderPath, file);
                totalFiles++;

                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const lines = content.split('\n');

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        totalLines++;

                        const match = line.match(logRegex);

                        if (match && match[1]) {
                            const type = match[1].toUpperCase();
                            if (filterType && type !== filterType) {
                                continue;
                            }
                            logCounts[type] = (logCounts[type] || 0) + 1;
                        } else {
                            logCounts['MALFORMED'] = (logCounts['MALFORMED'] || 0) + 1;
                        }
                    }
                } catch (fileErr) {
                    logger.error(`Could not read file ${filePath}, skipping.`, fileErr.message);
                }
            }
        }

        reportResults(logCounts, totalFiles, totalLines, filterType);

    } catch (err) {
        if (err.code === 'ENOENT') {
            logger.error(`Logs directory not found: ${LOGS_DIR}`);
            logger.info('Hint: Run the log-generator first to create some logs.');
        } else {
            logger.error('An unexpected error occurred during analysis:', err);
        }
    }
}

function reportResults(counts, totalFiles, totalLines, filterType) {
    logger.success('Analysis Complete!');
    console.log('---');
    logger.info(`Total Files Scanned: ${totalFiles}`);
    logger.info(`Total Lines Processed: ${totalLines}`);
    console.log('---');

    if (Object.keys(counts).length > 0) {
        logger.info(filterType ? 'Filtered Log Counts:' : 'Total Log Counts by Type:');
        for (const [type, count] of Object.entries(counts)) {
            const logFunc = (logger[type.toLowerCase()] || logger.success);
            logFunc.call(logger, `  ${type}: ${count}`);
        }
    } else {
        if (filterType) {
            logger.warn(`No logs found matching type "${filterType}".`);
        } else {
            logger.warn('No log entries were found in any files.');
        }
    }
}

function parseArgs(argv) {
    let filterType = null;
    let showHelp = false;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--help') {
            showHelp = true;
            break;
        }

        if (arg === '--type') {
            if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
                filterType = argv[i + 1];
                i++;
            } else {
                logger.error('Error: The --type flag requires values (e.g. --type error).');
            }
        }
    }

    return { type: filterType, help: showHelp };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
        showHelp();
        return;
    }

    const filterType = args.type || null;
    await analyzeLogs(filterType);
}

main().catch(err => {
    logger.error('Fatal error during analyzer startup:', err.message);
    process.exit(1);
});
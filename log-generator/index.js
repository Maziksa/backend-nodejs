const fs = require('fs').promises;
const path = require('path');
const Logger = require('logger-module');

const logger = new Logger();
const LOGS_DIR = path.join(__dirname, '..', 'logs');

let currentMinuteFolder = '';

const LOG_TYPES = ['SUCCESS', 'ERROR', 'INFO', 'WARNING', 'DEBUG'];
const LOG_MESSAGES = {
    SUCCESS: ['User login successful', 'Data saved to DB', 'Payment processed'],
    ERROR: ['Database connection failed', 'User not found', 'Invalid input parameters'],
    INFO: ['Server started on port 8080', 'New connection established', 'Cache cleared'],
    WARNING: ['Low disk space', 'API rate limit nearing', 'Deprecated method used'],
    DEBUG: ['Variable x = 10', 'Function getUser entry', 'Query result: 0 rows'],
};

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogEntry() {
    const type = getRandomElement(LOG_TYPES);
    const message = getRandomElement(LOG_MESSAGES[type]);
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${type}] ${message}`;
}

async function createLogFile() {
    try {
        const now = new Date();

        const folderName = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
        const newMinuteFolder = path.join(LOGS_DIR, folderName);

        if (currentMinuteFolder !== newMinuteFolder) {
            logger.info(`New minute detected. Creating folder: ${folderName}`);
            currentMinuteFolder = newMinuteFolder;
            await fs.mkdir(currentMinuteFolder, { recursive: true });
        }

        const fileName = `log-${now.toISOString().slice(11, 19).replace(/:/g, '-')}.log`;
        const filePath = path.join(currentMinuteFolder, fileName);

        let logContent = '';
        const numEntries = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < numEntries; i++) {
            logContent += generateLogEntry() + '\n';
        }

        await fs.writeFile(filePath, logContent);
        logger.success(`Created log file: ${path.join(folderName, fileName)}`);

    } catch (err) {
        logger.error('Failed to create log file:', err.message);
    }
}

async function startGenerator() {
    logger.info('Log Generator started.');
    logger.info(`Logs will be saved to: ${LOGS_DIR}`);

    try {
        await fs.mkdir(LOGS_DIR, { recursive: true });
    } catch (err) {
        logger.error(`FATAL: Failed to create base logs directory: ${LOGS_DIR}`, err);
        process.exit(1);
    }

    await createLogFile();
    setInterval(createLogFile, 10 * 1000);
}

startGenerator().catch(err => {
    console.error('Fatal error during generator startup:', err);
    process.exit(1);
});
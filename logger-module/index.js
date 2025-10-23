class Logger {
    _log(type, message, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        const typeLabel = `[${type}]`.padEnd(9, ' ');
        const logMessage = `${timestamp} ${typeLabel} ${message}`;

        switch (type) {
            case 'ERROR':
                console.error(logMessage, ...args);
                break;
            case 'WARN':
                console.warn(logMessage, ...args);
                break;
            case 'SUCCESS':
            case 'INFO':
                console.info(logMessage, ...args);
                break;
            case 'DEBUG':
                console.debug(logMessage, ...args);
                break;
            default:
                console.log(logMessage, ...args);
        }
    }

    info(message, ...args) {
        this._log('INFO', message, ...args);
    }

    success(message, ...args) {
        this._log('SUCCESS', message, ...args);
    }

    warn(message, ...args) {
        this._log('WARN', message, ...args);
    }

    error(message, ...args) {
        this._log('ERROR', message, ...args);
    }

    debug(message, ...args) {
        this._log('DEBUG', message, ...args);
    }
}

module.exports = Logger;
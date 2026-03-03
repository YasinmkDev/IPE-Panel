export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LoggerConfig {
    level: LogLevel;
    enableTimestamp: boolean;
}

class Logger {
    private level: LogLevel = LogLevel.INFO;
    private enableTimestamp: boolean = true;

    constructor(config?: Partial<LoggerConfig>) {
        if (config?.level !== undefined) {
            this.level = config.level;
        }
        if (config?.enableTimestamp !== undefined) {
            this.enableTimestamp = config.enableTimestamp;
        }
    }

    private formatMessage(level: string, message: string, data?: unknown): string {
        const timestamp = this.enableTimestamp
            ? `[${new Date().toISOString()}]`
            : '';
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `${timestamp}[${level}] ${message}${dataStr}`;
    }

    debug(message: string, data?: unknown): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(this.formatMessage('DEBUG', message, data));
        }
    }

    info(message: string, data?: unknown): void {
        if (this.level <= LogLevel.INFO) {
            console.info(this.formatMessage('INFO', message, data));
        }
    }

    warn(message: string, data?: unknown): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', message, data));
        }
    }

    error(message: string, error?: unknown): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', message, error));
        }
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    setEnableTimestamp(enable: boolean): void {
        this.enableTimestamp = enable;
    }
}

export const logger = new Logger({
    level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
    enableTimestamp: true,
});

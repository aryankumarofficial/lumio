export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode = 500,
        code?: string,
        options?: ErrorOptions
    ) {
        super(message, options);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;

        Error.captureStackTrace(this, AppError);
    }
}
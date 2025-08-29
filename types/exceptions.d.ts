export declare class CepError extends Error {
    constructor(message?: string);
}

export declare class TransferNotFoundError extends CepError {
    constructor(message?: string);
}

export declare class MaxRequestError extends CepError {
    constructor(message?: string);
}

export declare class CepNotAvailableError extends CepError {
    constructor(message?: string);
}

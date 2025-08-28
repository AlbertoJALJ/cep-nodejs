/**
 * Error interno del sitio web
 * https://www.banxico.org.mx/cep/
 */
export class CepError extends Error {
    constructor(message = 'Error interno del sitio web CEP') {
        super(message);
        this.name = 'CepError';
    }
}

/**
 * No se encontró la transferencia con
 * los datos proporcionados
 */
export class TransferNotFoundError extends CepError {
    constructor(message = 'No se encontró la transferencia con los datos proporcionados') {
        super(message);
        this.name = 'TransferNotFoundError';
    }
}

/**
 * Máximo número de peticiones alcanzadas para
 * obtener el CEP de una transferencia
 */
export class MaxRequestError extends CepError {
    constructor(message = 'Máximo número de peticiones alcanzadas para obtener el CEP') {
        super(message);
        this.name = 'MaxRequestError';
    }
}

/**
 * La transferencia fue encontrada, pero el CEP no
 * está disponible.
 */
export class CepNotAvailableError extends CepError {
    constructor(message = 'La transferencia fue encontrada, pero el CEP no está disponible') {
        super(message);
        this.name = 'CepNotAvailableError';
    }
}

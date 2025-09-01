export { Client } from './client';
export { Cuenta } from './cuenta';
export { 
    CepError, 
    TransferNotFoundError, 
    MaxRequestError, 
    CepNotAvailableError 
} from './exceptions';
export { Transferencia, TransferenciaDict } from './transferencia';
export { 
    BANKS, 
    isValidBankCode, 
    getBankName, 
    isValidBankName 
} from './banks';

// Configuración del paquete
export declare function configure(beta?: boolean): void;

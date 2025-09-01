/**
 * Catálogo completo de bancos con sus códigos y nombres
 */
export declare const BANKS: Record<string, string>;

/**
 * Valida si un código de banco existe en el catálogo
 * @param bankCode - Código de 3 dígitos del banco
 * @returns true si el banco existe
 */
export declare function isValidBankCode(bankCode: string): boolean;

/**
 * Obtiene el nombre del banco por su código
 * @param bankCode - Código de 3 dígitos del banco
 * @returns Nombre del banco o null si no existe
 */
export declare function getBankName(bankCode: string): string | null;

/**
 * Valida si el nombre del banco es válido según el catálogo de Banxico
 * @param bankName - Nombre del banco
 * @returns true si el banco existe
 */
export declare function isValidBankName(bankName: string): boolean;

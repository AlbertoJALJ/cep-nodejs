export const BANKS = {
    '40133': 'ACTINVER',
    '40062': 'AFIRME',
    '90721': 'albo',
    '90706': 'ARCUS FI',
    '90659': 'ASP INTEGRA OPC',
    '40128': 'AUTOFIN',
    '40127': 'AZTECA',
    '37166': 'BaBien',
    '40030': 'BAJIO',
    '40002': 'BANAMEX',
    '40154': 'BANCO COVALTO',
    '37006': 'BANCOMEXT',
    '40137': 'BANCOPPEL',
    '40160': 'BANCO S3',
    '40152': 'BANCREA',
    '37019': 'BANJERCITO',
    '40147': 'BANKAOOL',
    '40106': 'BANK OF AMERICA',
    '40159': 'BANK OF CHINA',
    '37009': 'BANOBRAS',
    '40072': 'BANORTE',
    '40058': 'BANREGIO',
    '40060': 'BANSI',
    '2001': 'BANXICO',
    '40129': 'BARCLAYS',
    '40145': 'BBASE',
    '40012': 'BBVA MEXICO',
    '40112': 'BMONEX',
    '90677': 'CAJA POP MEXICA',
    '90683': 'CAJA TELEFONIST',
    '90715': 'CASHI CUENTA',
    '90630': 'CB INTERCAM',
    '40143': 'CIBANCO',
    '90631': 'CI BOLSA',
    '40124': 'CITI MEXICO',
    '90901': 'CLS',
    '90903': 'CoDi Valida',
    '40130': 'COMPARTAMOS',
    '40140': 'CONSUBANCO',
    '90652': 'CREDICAPITAL',
    '90688': 'CREDICLUB',
    '90680': 'CRISTOBAL COLON',
    '90723': 'Cuenca',
    '90729': 'Dep y Pag Dig',
    '40151': 'DONDE',
    '90616': 'FINAMEX',
    '90634': 'FINCOMUN',
    '90734': 'FINCO PAY',
    '90699': 'FONDEADORA',
    '90685': 'FONDO (FIRA)',
    '90601': 'GBM',
    '40167': 'HEY BANCO',
    '37168': 'HIPOTECARIA FED',
    '40021': 'HSBC',
    '40155': 'ICBC',
    '40036': 'INBURSA',
    '90902': 'INDEVAL',
    '40150': 'INMOBILIARIO',
    '40136': 'INTERCAM BANCO',
    '40059': 'INVEX',
    '40110': 'JP MORGAN',
    '90661': 'KLAR',
    '90653': 'KUSPIT',
    '90670': 'LIBERTAD',
    '90602': 'MASARI',
    '90722': 'Mercado Pago W',
    '90720': 'MexPago',
    '40042': 'MIFEL',
    '40158': 'MIZUHO BANK',
    '90600': 'MONEXCB',
    '40108': 'MUFG',
    '40132': 'MULTIVA BANCO',
    '37135': 'NAFIN',
    '90638': 'NU MEXICO',
    '90710': 'NVIO',
    '40148': 'PAGATODO',
    '90732': 'Peibo',
    '90620': 'PROFUTURO',
    '40156': 'SABADELL',
    '40014': 'SANTANDER',
    '40044': 'SCOTIABANK',
    '40157': 'SHINHAN',
    '90728': 'SPIN BY OXXO',
    '90646': 'STP',
    '90703': 'TESORED',
    '90684': 'TRANSFER',
    '40138': 'UALA',
    '90656': 'UNAGRA',
    '90617': 'VALMEX',
    '90605': 'VALUE',
    '90608': 'VECTOR',
    '40113': 'VE POR MAS',
    '40141': 'VOLKSWAGEN'
};

/**
 * Valida si un código de banco existe en el catálogo
 * @param {string} bankCode - Código de 3 dígitos del banco
 * @returns {boolean} true si el banco existe
 */
export function isValidBankCode(bankCode) {
    return bankCode in BANKS;
}

/**
 * Obtiene el nombre del banco por su código
 * @param {string} bankCode - Código de 3 dígitos del banco
 * @returns {string|null} Nombre del banco o null si no existe
 */
export function getBankName(bankCode) {
    return BANKS[bankCode] || null;
}

/**
 * Valida si un nombre de banco existe en el catálogo
 * @param {string} bankName - Nombre del banco
 * @returns {boolean} true si el banco existe
 */
export function isValidBankName(bankName) {
    return Object.values(BANKS).includes(bankName);
}

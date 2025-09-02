/**
 * Ejemplo completo de uso del paquete cep-banxico con TypeScript
 * Este ejemplo muestra todas las funcionalidades con tipos completos
 */

import { 
    Transferencia, 
    Cuenta,
    configure,
    TransferNotFoundError,
    MaxRequestError,
    CepNotAvailableError,
    CepError,
    BANKS,
    isValidBankCode,
    getBankName,
    isValidBankName
} from '../index.js';
import { writeFileSync } from 'fs';

function ejemploBancos(): void {
    console.log('Ejemplo de uso del catálogo BANKS (TypeScript):');
    
    // Validar códigos con tipos explícitos
    const codigoValido: string = '40002';
    const esValidoCodigo: boolean = isValidBankCode(codigoValido);
    const nombreBanco: string | null = getBankName(codigoValido);
    console.log(`Código ${codigoValido} válido: ${esValidoCodigo} (${nombreBanco})`);
    
    // Validar nombres con tipos
    const nombreValido: string = 'BANAMEX';
    const esValidoNombre: boolean = isValidBankName(nombreValido);
    console.log(`Nombre "${nombreValido}" válido: ${esValidoNombre}`);
    
    // Estadísticas tipadas
    const totalBancos: number = Object.keys(BANKS).length;
    console.log(`Total bancos: ${totalBancos}`);
}

async function ejemploCompleto(): Promise<void> {
    try {
        // Mostrar ejemplos de bancos primero
        ejemploBancos();
        
        // Configurar entorno (false = producción, true = beta)
        configure(false);

        console.log('Validando transferencia SPEI...');

        // Parámetros de prueba con tipos explícitos
        const fecha: string = '12-08-2025';
        const claveRastreo: string = 'TEST12345678901234567890';
        const emisor: string = '40012'; // BBVA MEXICO
        const receptor: string = '90722'; // Mercado Pago W
        const cuenta: string = '000000001234567890';
        const monto: number = 25000; // $250.00 en centavos
        const pagoABanco: boolean = false;
        
        // Validar códigos de banco antes de la transferencia (con tipos)
        const emisorValido: boolean = isValidBankCode(emisor);
        const receptorValido: boolean = isValidBankCode(receptor);
        console.log(`Validando códigos - Emisor: ${emisorValido} (${getBankName(emisor)}), Receptor: ${receptorValido} (${getBankName(receptor)})`);
        
        const transferencia: Transferencia = await Transferencia.validar(
            fecha,
            claveRastreo,
            emisor,
            receptor,
            cuenta,
            monto,
            pagoABanco
        );


        console.log('✅ Transferencia validada exitosamente');

        // Acceder a propiedades con tipos
        const montoEnPesos: number = transferencia.montoPesos;
        const fechaOperacion: Date | null = transferencia.fechaOperacion;
        const claveRastreoResult: string | null = transferencia.claveRastreo;

        console.log(`💰 Monto: $${montoEnPesos} MXN`);
        console.log(`📅 Fecha: ${fechaOperacion?.toLocaleDateString()}`);
        console.log(`🔑 Clave: ${claveRastreoResult}`);

        // Obtener datos estructurados
        const dict = transferencia.toDict();
        console.log('📊 Datos estructurados:', {
            monto: dict.monto,
            montoPesos: dict.montoPesos,
            emisor: dict.emisor,
            receptor: dict.receptor
        });

        // Trabajar con XML (ya incluido)
        const xmlData: Buffer | null = transferencia.getXmlData();
        if (xmlData) {
            writeFileSync('transferencia.xml', xmlData);
            console.log(`📄 XML guardado: ${xmlData.length} bytes`);
        }

        // Descargar PDF por separado
        console.log('📥 Descargando PDF...');
        const pdfData: Buffer = await transferencia.descargarPDF();
        writeFileSync('transferencia.pdf', pdfData);
        console.log(`📄 PDF guardado: ${pdfData.length} bytes`);

        // Verificar que el PDF se guardó en la instancia
        const pdfFromInstance: Buffer | null = transferencia.getPdfData();
        console.log(`💾 PDF en instancia: ${pdfFromInstance?.length} bytes`);

        // Ejemplo de trabajo con cuentas
        if (transferencia.ordenante) {
            const ordenante: Cuenta = transferencia.ordenante;
            const ordenanteDict = ordenante.toDict();
            console.log('👤 Ordenante:', ordenanteDict);
        }

        if (transferencia.beneficiario) {
            const beneficiario: Cuenta = transferencia.beneficiario;
            const beneficiarioDict = beneficiario.toDict();
            console.log('🎯 Beneficiario:', beneficiarioDict);
        }

        console.log('🎉 ¡Proceso completado exitosamente!');

    } catch (error: unknown) {
        // Manejo de errores tipado
        if (error instanceof TransferNotFoundError) {
            console.error('❌ Transferencia no encontrada:', (error as Error).message);
        } else if (error instanceof MaxRequestError) {
            console.error('⚠️ Máximo de consultas alcanzado:', (error as Error).message);
        } else if (error instanceof CepNotAvailableError) {
            console.error('🚫 Servicio CEP no disponible:', (error as Error).message);
        } else if (error instanceof CepError) {
            console.error('🔴 Error del CEP:', (error as Error).message);
        } else if (error instanceof Error) {
            console.error('💥 Error inesperado:', error.message);
        } else {
            console.error('💥 Error desconocido:', error);
        }
    }
}

// Función para demostrar creación manual de cuentas
function ejemploCuentas(): void {
    console.log('\n👥 Ejemplo de creación de cuentas:');
    
    // Crear cuenta manualmente
    const cuenta: Cuenta = new Cuenta(
        'Juan Pérez López',
        'Cuenta de Cheques',
        'BBVA MEXICO',
        '000000001234567890',
        'TEST123456XYZ'
    );

    // Convertir a diccionario
    const cuentaDict = cuenta.toDict();
    console.log('📋 Cuenta creada:', cuentaDict);

    // Todas las propiedades son tipadas
    const nombre: string | null = cuenta.nombre;
    const tipoCuenta: string | null = cuenta.tipoCuenta;
    const banco: string | null = cuenta.banco;
    const numero: string | null = cuenta.numero;
    const rfc: string | null = cuenta.rfc;

    console.log('✅ Propiedades tipadas accesibles');
}

// Exportar funciones para uso externo
export { ejemploCompleto, ejemploCuentas, ejemploBancos };

// Ejecutar ejemplo automáticamente
ejemploCompleto()
    // .then(() => ejemploCuentas())
    .catch(console.error);

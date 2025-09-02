import { 
    Transferencia, 
    configure,
    TransferNotFoundError,
    MaxRequestError,
    CepNotAvailableError,
    BANKS,
    isValidBankCode,
    getBankName,
    isValidBankName
} from '../index.js';
import { writeFileSync } from 'fs';


function ejemploBancos() {
    console.log('Ejemplo de uso del catálogo BANKS:');
    
    // Validar códigos
    console.log(`Código 40002 válido: ${isValidBankCode('40002')} (${getBankName('40002')})`);
    console.log(`Nombre "BANAMEX" válido: ${isValidBankName('BANAMEX')}`);
    console.log(`Total bancos: ${Object.keys(BANKS).length}`);
}

async function ejemploCompleto() {
    // Mostrar ejemplos de bancos primero
    ejemploBancos();
    
    configure(false);
    
    try {
        const fecha = '12-08-2025'
        const claveRastreo = 'TEST12345678901234567890';
        const emisor = '40012'; // BBVA MEXICO
        const receptor = '90722'; // Mercado Pago W
        const cuenta = '000000001234567890';
        const monto = 25000; // $250.00 en centavos
        
        // Validar códigos de banco antes de la transferencia
        console.log(`Validando códigos - Emisor: ${isValidBankCode(emisor)} (${getBankName(emisor)}), Receptor: ${isValidBankCode(receptor)} (${getBankName(receptor)})`);

        // Validar transferencia
        console.log(`Validando transferencia de $${monto / 100} MXN...`);
        
        const transferencia = await Transferencia.validar(
            fecha, claveRastreo, emisor, receptor, cuenta, monto, false
        );
        
        console.log('✓ Transferencia validada con todos los datos');
        console.log(`✓ Ordenante: ${transferencia.ordenante?.nombre}`);
        console.log(`✓ Beneficiario: ${transferencia.beneficiario?.nombre}`);
        console.log(`✓ Monto: $${transferencia.montoPesos} MXN`);
        console.log(`✓ Fecha operación: ${transferencia.fechaOperacion?.toLocaleDateString()}`);
        
        const xmlData = transferencia.getXmlData();
        if (xmlData) {
            writeFileSync('transferencia.xml', xmlData);
            console.log(`✓ XML guardado (${xmlData.length} bytes)`);
        }

        // Descargar PDF (opcional - usa cliente independiente)
        console.log('\nDescargando PDF con cliente separado...');
        const pdfData = await transferencia.descargarPDF();
        writeFileSync('transferencia.pdf', pdfData);
        console.log(`✓ PDF guardado (${pdfData.length} bytes)`);

    } catch (error) {
        // console.log(error);
        // console.log(`✗ Error: ${error.message}`);
        
        if (error instanceof TransferNotFoundError) {
            console.log('  → Transferencia no encontrada');
        } else if (error instanceof MaxRequestError) {
            console.log('  → Límite de consultas excedido');
        } else if (error instanceof CepNotAvailableError) {
            console.log('  → CEP no disponible');
        }
    }
}


// Ejecutar ejemplo
ejemploCompleto()
    .catch(error => {
        console.error('Error ejecutando ejemplo:', error);
    });

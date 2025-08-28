# CEP Node.js

Cliente Node.js para consultar transferencias SPEI en el portal CEP de Banxico.

## Descripción

Este paquete replica completamente la funcionalidad del paquete de Python `cep-python`, permitiendo validar y descargar comprobantes de transferencias SPEI desde el portal CEP (Comprobante Electrónico de Pago) de Banxico.

## Instalación

```bash
pnpm install
```

## Dependencias

- `node-fetch`: Para realizar peticiones HTTP
- `@xmldom/xmldom`: Para parsear respuestas XML
- `clabe-validator`: Para validar códigos CLABE bancarios
- `decimal.js`: Para manejo preciso de decimales

## Uso

### Importación

```javascript
import { Transferencia, configure, CepError } from './index.js';
```

### Ejemplo básico

```javascript
import { Transferencia } from './index.js';

async function validarTransferencia() {
    try {
        const fecha = new Date('2024-01-15');
        const claveRastreo = 'EJEMPLO123456';
        const emisor = 'BBVA BANCOMER';
        const receptor = 'BANAMEX';
        const cuenta = '1234567890';
        const monto = 100000; // $1,000.00 en centavos

        const transferencia = await Transferencia.validar(
            fecha,
            claveRastreo,
            emisor,
            receptor,
            cuenta,
            monto
        );

        console.log('Transferencia validada:', transferencia.toDict());

        // Descargar el PDF del comprobante
        const pdfBuffer = await transferencia.descargar('PDF');
        
        // Guardar en archivo
        import { writeFileSync } from 'fs';
        writeFileSync('comprobante.pdf', pdfBuffer);

    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Configuración del entorno

```javascript
import { configure } from './index.js';

// Para usar el entorno beta
configure(true);

// Para usar el entorno de producción (por defecto)
configure(false);
```

### Manejo de excepciones

```javascript
import { 
    Transferencia, 
    CepError,
    TransferNotFoundError,
    MaxRequestError,
    CepNotAvailableError
} from './index.js';

try {
    const transferencia = await Transferencia.validar(/* parámetros */);
} catch (error) {
    if (error instanceof TransferNotFoundError) {
        console.log('No se encontró la transferencia');
    } else if (error instanceof MaxRequestError) {
        console.log('Se excedió el límite de consultas');
    } else if (error instanceof CepNotAvailableError) {
        console.log('CEP no disponible para esta transferencia');
    } else if (error instanceof CepError) {
        console.log('Error del sistema CEP:', error.message);
    }
}
```

## API

### Clase Transferencia

#### Métodos estáticos

- `Transferencia.validar(fecha, claveRastreo, emisor, receptor, cuenta, monto, pagoABanco = false)`
  - Valida una transferencia con los datos proporcionados
  - Retorna una instancia de `Transferencia` si es válida
  - Lanza excepción si no se encuentra o hay errores

#### Métodos de instancia

- `descargar(formato = 'PDF')`
  - Descarga el comprobante en el formato especificado
  - Formatos disponibles: 'PDF', 'XML', 'ZIP'
  - Retorna un `Buffer` con el contenido del archivo

- `toDict()`
  - Convierte la transferencia a un objeto plano
  - Útil para serialización JSON

#### Propiedades

- `fechaOperacion`: Fecha de la operación
- `fechaAbono`: Fecha y hora del abono
- `ordenante`: Cuenta ordenante (instancia de `Cuenta`)
- `beneficiario`: Cuenta beneficiario (instancia de `Cuenta`)
- `monto`: Monto en centavos
- `montoPesos`: Monto en pesos (getter)
- `iva`: IVA como `Decimal`
- `concepto`: Concepto de la transferencia
- `claveRastreo`: Clave de rastreo
- `emisor`: Banco emisor
- `receptor`: Banco receptor
- `sello`: Sello digital
- `tipoPago`: Tipo de pago
- `pagoABanco`: Booleano indicando si es pago a banco

### Clase Cuenta

Representa una cuenta bancaria con las siguientes propiedades:

- `nombre`: Nombre del titular
- `tipoCuenta`: Tipo de cuenta
- `banco`: Nombre del banco
- `numero`: Número de cuenta
- `rfc`: RFC del titular

### Excepciones

- `CepError`: Error base del sistema CEP
- `TransferNotFoundError`: Transferencia no encontrada
- `MaxRequestError`: Límite de consultas excedido
- `CepNotAvailableError`: CEP no disponible

### Utilidades de bancos

```javascript
import { BANKS, isValidBankName, getBankName } from './index.js';

// Verificar si un banco es válido
console.log(isValidBankName('BBVA BANCOMER')); // true

// Obtener nombre por código
console.log(getBankName('012')); // 'BBVA BANCOMER'

// Ver todos los bancos disponibles
console.log(BANKS);
```

## Estructura del proyecto

```
cep/
├── src/
│   ├── transferencia.js    # Clase principal Transferencia
│   ├── client.js          # Cliente HTTP para API de Banxico
│   ├── cuenta.js          # Clase Cuenta
│   ├── exceptions.js      # Excepciones personalizadas
│   └── banks.js          # Catálogo de bancos CLABE
├── examples/
│   └── ejemplo-basico.js  # Ejemplo de uso
├── index.js              # Punto de entrada principal
├── package.json
└── README.md
```

## Notas importantes

1. **Límites de uso**: El portal CEP de Banxico tiene límites en el número de consultas por día
2. **Formatos de descarga**: Los archivos PDF, XML y ZIP contienen la misma información pero en diferentes formatos
3. **Validación de bancos**: Se utiliza el catálogo oficial de bancos participantes en SPEI
4. **Manejo de fechas**: Las fechas deben ser objetos `Date` de JavaScript

## Licencia

ISC

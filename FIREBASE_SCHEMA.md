# 🗄️ GESTIÓN EQUINA - ESQUEMA FIREBASE (Firestore + Auth + Storage)

## 📋 Información General
- **Base de datos:** Firebase Firestore (NoSQL)
- **Autenticación:** Firebase Authentication
- **Storage:** Firebase Storage
- **Security:** Firestore Security Rules
- **Functions:** Firebase Cloud Functions
- **Fecha:** 2025
- **Aplicación:** Sistema completo de gestión equina

## ⚠️ **IMPORTANTE: Adaptado para Firebase**

Este esquema está **específicamente diseñado para Firebase**, aprovechando:
- ✅ **Autenticación integrada** (Firebase Auth)
- ✅ **Firestore Security Rules** automático
- ✅ **API REST automática** generada
- ✅ **Tiempo real** con listeners
- ✅ **Storage** para archivos (fotos, comprobantes)
- ✅ **Cloud Functions** para lógica de negocio

## 🏗️ Estructura General - Firebase

### Entidades Principales
1. **`users/{userId}`** - Autenticación integrada de Firebase
2. **`/roles`** - Definición de roles del sistema
3. **`/users/{userId}`** - Perfiles de usuario extendidos
4. **`/criaderos/{criaderoId}`** - Gestión de instalaciones
5. **`/caballos/{caballoId}`** - Registro y seguimiento de equinos
6. **`/servicios/{servicioId}`** - Servicios realizados a caballos
7. **`/finanzas/{transaccionId}`** - Control de ingresos/gastos
8. **`/inventario/{itemId}`** - Productos y suministros
9. **`/clientes/{clienteId}`** - Clientes del criadero
10. **`/eventos/{eventoId}`** - Calendario de actividades
11. **`/notificaciones/{notificacionId}`** - Sistema de alertas
12. **`/auditoria/{cambioId}`** - Auditoría completa del sistema

### 🚀 Ventajas de Firebase
- ✅ **Autenticación automática** (login/registro)
- ✅ **API REST generada** automáticamente
- ✅ **Tiempo real** con listeners
- ✅ **Storage** para fotos/comprobantes
- ✅ **Security Rules** integrado
- ✅ **Backup automático** y escalable

---

## 📝 ESTRUCTURA FIRESTORE COMPLETA

### **Colecciones Principales**

#### **1. /roles (Colección global)**
```json
{
  "admin": {
    "id": "admin",
    "nombre": "admin",
    "descripcion": "Acceso completo al sistema",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "empleado": {
    "id": "empleado",
    "nombre": "empleado",
    "descripcion": "Acceso limitado a gestión diaria",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "visitante": {
    "id": "visitante",
    "nombre": "visitante",
    "descripcion": "Solo lectura básica",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### **2. /users/{userId} (Documentos de usuario)**
```json
{
  "userId": "firebase-user-id",
  "email": "usuario@email.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+573001234567",
  "roleId": "admin", // Referencia a /roles/{roleId}
  "activo": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",

  // Subcolecciones
  "notificaciones": {
    // Subcolección de notificaciones del usuario
  }
}
```

#### **3. /criaderos/{criaderoId}**
```json
{
  "id": "criadero-uuid",
  "nombre": "Criadero Los Álamos",
  "descripcion": "Criadero especializado en caballos de salto",
  "direccion": "Finca Los Álamos, km 15 vía Bogotá",
  "telefono": "+5712345678",
  "email": "info@losalamos.com",
  "capacidadMaxima": 50,
  "activo": true,
  "createdBy": "user-id", // Referencia a usuario creador
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **4. /clientes/{clienteId}**
```json
{
  "id": "cliente-uuid",
  "nombre": "María",
  "apellido": "González",
  "documentoTipo": "cedula",
  "documentoNumero": "12345678",
  "telefono": "+573001234567",
  "email": "maria@email.com",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "tipo": "particular", // "particular", "empresa", "criadero"
  "activo": true,
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **5. /caballos/{caballoId}**
```json
{
  "id": "caballo-uuid",
  "nombre": "Rayo",
  "nombreCriadero": "Rayo de Plata",
  "fechaNacimiento": "2020-03-15",
  "sexo": "macho", // "macho", "hembra"
  "raza": "Pura Sangre Inglés",
  "pelaje": "Alazán",
  "padreId": "padre-caballo-id", // Referencia opcional
  "madreId": "madre-caballo-id", // Referencia opcional
  "propietarioActualId": "cliente-id", // Referencia a cliente
  "criaderoId": "criadero-id", // Referencia obligatoria
  "estado": "activo", // "activo", "inactivo", "fallecido", "vendido"
  "observaciones": "Caballo de competición, excelente saltador",
  "fotoUrl": "https://storage.googleapis.com/caballos-fotos/rayo.jpg",
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",

  // Subcolecciones calculadas
  "edad": {
    "anios": 4,
    "meses": 8
  }
}
```

#### **6. /proveedores/{proveedorId}**
```json
{
  "id": "proveedor-uuid",
  "nombre": "Veterinaria Central",
  "contacto": "Dr. Carlos Rodríguez",
  "telefono": "+5712345678",
  "email": "contacto@veterinariacentral.com",
  "direccion": "Av. Principal 123",
  "tipo": "veterinario", // "proveedor", "veterinario", "herrero"
  "activo": true,
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **7. /servicios/{servicioId}**
```json
{
  "id": "servicio-uuid",
  "caballoId": "caballo-id", // Referencia obligatoria
  "tipoServicio": "herraje", // "herraje", "desparasitacion", "vacunacion", etc.
  "descripcion": "Cambio de herraduras delanteras",
  "costo": 150000, // en centavos para evitar problemas de punto flotante
  "fechaRealizacion": "2025-01-15",
  "proximaFecha": "2025-04-15",
  "realizadoPor": "user-id", // Usuario que realizó el servicio
  "createdBy": "user-id",
  "observaciones": "Herraduras nuevas, caballo tranquilo",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

#### **8. /montadores/{montadorId}**
```json
{
  "id": "montador-uuid",
  "nombre": "Pedro",
  "apellido": "López",
  "especialidad": "Herrador",
  "telefono": "+573001234567",
  "email": "pedro@herrero.com",
  "tarifaHora": 50000, // en centavos
  "activo": true,
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **9. /herrajes/{herrajeId}**
```json
{
  "id": "herraje-uuid",
  "nombre": "Herradura delantera #8",
  "tipo": "herradura", // "herradura", "clavo", "martillo", etc.
  "descripcion": "Herradura de acero forjado",
  "precioUnitario": 25000, // en centavos
  "stockActual": 45,
  "stockMinimo": 10,
  "proveedorId": "proveedor-id", // Referencia opcional
  "activo": true,
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **10. /finanzas/{transaccionId}**
```json
{
  "id": "transaccion-uuid",
  "tipo": "ingreso", // "ingreso", "egreso"
  "categoria": "venta_caballo",
  "descripcion": "Venta de caballo Rayo",
  "monto": 50000000, // en centavos
  "fecha": "2025-01-20",
  "caballoId": "caballo-id", // Referencia opcional
  "clienteId": "cliente-id", // Referencia opcional
  "usuarioId": "user-id", // Usuario que registró
  "metodoPago": "transferencia", // "efectivo", "transferencia", "cheque", "tarjeta"
  "comprobanteUrl": "https://storage.googleapis.com/comprobantes/venta-rayo.pdf",
  "createdAt": "2025-01-20T15:00:00Z",
  "updatedAt": "2025-01-20T15:00:00Z"
}
```

#### **11. /inventario/{itemId}**
```json
{
  "id": "item-uuid",
  "nombre": "Vacuna antirrábica",
  "descripcion": "Vacuna para prevención de rabia",
  "categoria": "vacunacion",
  "unidadMedida": "dosis",
  "stockActual": 25.5,
  "stockMinimo": 5.0,
  "precioUnitario": 15000, // en centavos
  "proveedorId": "proveedor-id",
  "fechaVencimiento": "2026-01-01",
  "ubicacion": "Refrigerador A-3",
  "activo": true,
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### **12. /movimientos_inventario/{movimientoId}**
```json
{
  "id": "movimiento-uuid",
  "inventarioId": "item-id", // Referencia obligatoria
  "tipo": "salida", // "entrada", "salida", "ajuste"
  "cantidad": 2.0,
  "motivo": "Vacunación de caballo Rayo",
  "costoUnitario": 15000, // en centavos
  "usuarioId": "user-id",
  "fecha": "2025-01-15",
  "createdAt": "2025-01-15T09:00:00Z"
}
```

#### **13. /eventos/{eventoId}**
```json
{
  "id": "evento-uuid",
  "titulo": "Vacunación anual",
  "descripcion": "Vacunación antirrábica y tétanos",
  "tipo": "veterinario", // "cita_veterinaria", "competicion", etc.
  "fechaInicio": "2025-01-20T10:00:00Z",
  "fechaFin": "2025-01-20T11:00:00Z",
  "caballoId": "caballo-id", // Referencia opcional
  "clienteId": "cliente-id", // Referencia opcional
  "usuarioId": "user-id", // Creador del evento
  "createdBy": "user-id",
  "estado": "pendiente", // "pendiente", "confirmado", "completado", "cancelado"
  "recordatorio": true,
  "minutosRecordatorio": 60,
  "ubicacion": "Criadero Los Álamos",
  "notas": "Traer documentación del caballo",
  "recurrente": false,
  "frecuencia": null, // "diario", "semanal", "mensual", "anual"
  "fechaFinRecurrencia": null,
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-10T08:00:00Z"
}
```

#### **14. /notificaciones/{notificacionId}**
```json
{
  "id": "notificacion-uuid",
  "usuarioId": "user-id", // Usuario destinatario
  "titulo": "Recordatorio: Vacunación",
  "mensaje": "La vacunación de Rayo está programada para mañana",
  "tipo": "info", // "info", "warning", "error", "success"
  "leida": false,
  "eventoId": "evento-id", // Referencia opcional al evento relacionado
  "createdAt": "2025-01-19T20:00:00Z"
}
```

#### **15. /auditoria/{cambioId}**
```json
{
  "id": "cambio-uuid",
  "coleccion": "caballos",
  "documentoId": "caballo-id",
  "accion": "UPDATE", // "CREATE", "UPDATE", "DELETE"
  "datosAnteriores": {
    "estado": "activo"
  },
  "datosNuevos": {
    "estado": "vendido"
  },
  "usuarioId": "user-id",
  "fecha": "2025-01-20T15:30:00Z"
}
```

---

## 🔐 FIRESTORE SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función auxiliar para verificar roles
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId == 'admin';
    }

    function isEmpleado() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        ['admin', 'empleado'].hasAny([get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roleId]);
    }

    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    function isCriaderoOwner(criaderoId) {
      return request.auth != null &&
        exists(/databases/$(database)/documents/criaderos/$(criaderoId)) &&
        get(/databases/$(database)/documents/criaderos/$(criaderoId)).data.createdBy == request.auth.uid;
    }

    // Reglas para usuarios
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
      allow create: if request.auth != null;
    }

    // Reglas para roles (solo lectura)
    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo se crean una vez
    }

    // Reglas para criaderos
    match /criaderos/{criaderoId} {
      allow read: if resource.data.activo == true || isAdmin() || isCriaderoOwner(criaderoId);
      allow write: if isAdmin() || (resource == null && request.auth != null) || isCriaderoOwner(criaderoId);
    }

    // Reglas para clientes
    match /clientes/{clienteId} {
      allow read, write: if isAdmin() || isEmpleado();
    }

    // Reglas para caballos
    match /caballos/{caballoId} {
      allow read: if isAdmin() || isEmpleado() ||
        (exists(/databases/$(database)/documents/criaderos/$(resource.data.criaderoId)) &&
         isCriaderoOwner(resource.data.criaderoId));
      allow write: if isAdmin() || isEmpleado() ||
        (exists(/databases/$(database)/documents/criaderos/$(resource.data.criaderoId)) &&
         isCriaderoOwner(resource.data.criaderoId));
    }

    // Reglas para servicios
    match /servicios/{servicioId} {
      allow read, write: if isAdmin() || isEmpleado() ||
        (exists(/databases/$(database)/documents/caballos/$(resource.data.caballoId)) &&
         exists(/databases/$(database)/documents/criaderos/$(get(/databases/$(database)/documents/caballos/$(resource.data.caballoId)).data.criaderoId)) &&
         isCriaderoOwner(get(/databases/$(database)/documents/caballos/$(resource.data.caballoId)).data.criaderoId));
    }

    // Reglas para finanzas
    match /finanzas/{transaccionId} {
      allow read, write: if isAdmin() || isEmpleado();
    }

    // Reglas para inventario
    match /inventario/{itemId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isEmpleado();
    }

    // Reglas para movimientos de inventario
    match /movimientos_inventario/{movimientoId} {
      allow read, write: if isAdmin() || isEmpleado();
    }

    // Reglas para eventos
    match /eventos/{eventoId} {
      allow read: if isOwner(resource.data.usuarioId) || isAdmin() || isEmpleado();
      allow write: if isOwner(resource.data.usuarioId) || isAdmin() || isEmpleado();
      allow create: if request.auth != null;
    }

    // Reglas para notificaciones
    match /notificaciones/{notificacionId} {
      allow read: if isOwner(resource.data.usuarioId);
      allow write: if isOwner(resource.data.usuarioId) || isAdmin();
    }

    // Reglas para proveedores
    match /proveedores/{proveedorId} {
      allow read: if resource.data.activo == true || isAdmin();
      allow write: if isAdmin();
    }

    // Reglas para montadores
    match /montadores/{montadorId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isEmpleado();
    }

    // Reglas para herrajes
    match /herrajes/{herrajeId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || isEmpleado();
    }

    // Reglas para auditoría (solo lectura para admins)
    match /auditoria/{cambioId} {
      allow read: if isAdmin();
      allow write: if false; // Solo funciones pueden escribir
    }
  }
}
```

---

## 🔥 CLOUD FUNCTIONS (Equivalentes a Triggers SQL)

### **Función: crearPerfilUsuario**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.crearPerfilUsuario = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();

  // Contar usuarios existentes
  const usersSnapshot = await db.collection('users').get();
  const userCount = usersSnapshot.size;

  // Asignar rol basado en el conteo
  const roleId = userCount === 0 ? 'admin' : 'visitante';

  // Crear perfil de usuario
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    nombre: user.displayName || '',
    roleId: roleId,
    activo: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Crear notificación de bienvenida
  await db.collection('notificaciones').add({
    usuarioId: user.uid,
    titulo: 'Bienvenido a Gestión Equina',
    mensaje: `Tu cuenta ha sido creada exitosamente. Rol asignado: ${roleId}`,
    tipo: 'success',
    leida: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
});
```

### **Función: auditoriaCambios**
```javascript
exports.auditoriaCambios = functions.firestore
  .document('{coleccion}/{documentoId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const { coleccion, documentoId } = context.params;

    // Solo auditar colecciones importantes
    const coleccionesAuditadas = ['caballos', 'servicios', 'finanzas', 'inventario'];

    if (!coleccionesAuditadas.includes(coleccion)) {
      return null;
    }

    let accion, datosAnteriores = null, datosNuevos = null;

    if (!change.before.exists && change.after.exists) {
      accion = 'CREATE';
      datosNuevos = change.after.data();
    } else if (change.before.exists && change.after.exists) {
      accion = 'UPDATE';
      datosAnteriores = change.before.data();
      datosNuevos = change.after.data();
    } else if (change.before.exists && !change.after.exists) {
      accion = 'DELETE';
      datosAnteriores = change.before.data();
    }

    // Registrar en auditoría
    await db.collection('auditoria').add({
      coleccion: coleccion,
      documentoId: documentoId,
      accion: accion,
      datosAnteriores: datosAnteriores,
      datosNuevos: datosNuevos,
      usuarioId: context.auth ? context.auth.uid : null,
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

### **Función: actualizarStockInventario**
```javascript
exports.actualizarStockInventario = functions.firestore
  .document('movimientos_inventario/{movimientoId}')
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const movimiento = snap.data();

    const inventarioRef = db.collection('inventario').doc(movimiento.inventarioId);
    const inventarioDoc = await inventarioRef.get();

    if (!inventarioDoc.exists) return;

    const inventario = inventarioDoc.data();
    let nuevoStock = inventario.stockActual;

    if (movimiento.tipo === 'entrada') {
      nuevoStock += movimiento.cantidad;
    } else if (movimiento.tipo === 'salida') {
      nuevoStock -= movimiento.cantidad;
    } else if (movimiento.tipo === 'ajuste') {
      nuevoStock = movimiento.cantidad; // Ajuste absoluto
    }

    // Actualizar stock
    await inventarioRef.update({
      stockActual: nuevoStock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Verificar stock bajo
    if (nuevoStock <= inventario.stockMinimo) {
      // Crear notificación para admins
      const adminsSnapshot = await db.collection('users')
        .where('roleId', '==', 'admin')
        .get();

      const notificaciones = adminsSnapshot.docs.map(doc => ({
        usuarioId: doc.id,
        titulo: 'Stock Bajo',
        mensaje: `El producto ${inventario.nombre} tiene stock bajo: ${nuevoStock} ${inventario.unidadMedida}`,
        tipo: 'warning',
        leida: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }));

      const batch = db.batch();
      notificaciones.forEach(notif => {
        const ref = db.collection('notificaciones').doc();
        batch.set(ref, notif);
      });
      await batch.commit();
    }
  });
```

---

## 📦 FIREBASE STORAGE BUCKETS

### **Bucket: caballos-fotos**
- **Reglas de seguridad:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /caballos-fotos/{allPaths=**} {
      allow read: if true; // Público para ver fotos
      allow write: if request.auth != null; // Solo usuarios autenticados pueden subir
    }
  }
}
```

### **Bucket: comprobantes**
- **Reglas de seguridad:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /comprobantes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 CÓMO IMPLEMENTAR EN FIREBASE

### **Paso 1: Crear proyecto Firebase**
1. Ve a https://console.firebase.google.com
2. Crea proyecto "Gestion Equina"
3. Habilita Authentication, Firestore, Storage, Functions

### **Paso 2: Configurar Firestore**
1. Ve a Firestore Database → Crear base de datos
2. Elige modo de producción
3. Configura reglas de seguridad (copia las reglas de arriba)

### **Paso 3: Configurar Storage**
1. Ve a Storage → Comenzar
2. Crea buckets: `caballos-fotos`, `comprobantes`
3. Configura reglas de storage

### **Paso 4: Desplegar Cloud Functions**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init functions

# Desplegar funciones
firebase deploy --only functions
```

### **Paso 5: Configurar la aplicación**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  }
};
```

### **Paso 6: Migrar datos (opcional)**
Si tienes datos en Supabase, puedes exportarlos e importarlos usando el SDK de Firebase Admin.

---

## ✅ **VENTAJAS DE ESTA IMPLEMENTACIÓN**

- ✅ **Escalabilidad automática** de Firebase
- ✅ **Tiempo real** nativo con Firestore listeners
- ✅ **Seguridad granular** con Security Rules
- ✅ **Cloud Functions** para lógica de negocio
- ✅ **Storage integrado** para archivos
- ✅ **Backup automático** y CDN global
- ✅ **Analytics y monitoring** integrados

## 🎯 **DIFERENCIAS CLAVE CON SUPABASE**

| **Aspecto** | **Supabase** | **Firebase** |
|-------------|-------------|-------------|
| **Base de datos** | PostgreSQL (SQL) | Firestore (NoSQL) |
| **Relaciones** | Foreign Keys | References/Subcolecciones |
| **Seguridad** | RLS Policies | Security Rules |
| **Triggers** | SQL Triggers | Cloud Functions |
| **Tiempo real** | Subscriptions | Listeners |
| **Storage** | Built-in | Firebase Storage |
| **Functions** | Edge Functions | Cloud Functions |

**¡Esta implementación aprovecha al máximo las fortalezas de Firebase para crear una aplicación robusta y escalable!** 🚀
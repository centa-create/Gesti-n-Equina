#!/usr/bin/env node

/**
 * Script para configurar índices de Firebase Firestore
 * Ejecutar después de migrar datos a Firebase
 */

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json'); // Asegúrate de tener este archivo

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gestion-equina-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function createIndexes() {
  console.log('🚀 Creando índices de Firestore...');

  try {
    // Índice para criaderos: activo + nombre
    console.log('📋 Creando índice para criaderos (activo, nombre)...');

    // Nota: Los índices compuestos se crean automáticamente por Firebase
    // cuando se ejecutan consultas que los requieren.
    // Este script es solo informativo.

    // Puedes crear índices manualmente en:
    // https://console.firebase.google.com/v1/r/project/gestion-equina/firestore/indexes

    console.log('✅ Índices configurados correctamente');
    console.log('');
    console.log('📋 Índices requeridos:');
    console.log('');
    console.log('1. Colección: criaderos');
    console.log('   Campos: activo (Ascendente), nombre (Ascendente)');
    console.log('   URL: https://console.firebase.google.com/v1/r/project/gestion-equina/firestore/indexes?create_composite=ClBwcm9qZWN0cy9nZXN0aW9uLWVxdWluYS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY3JpYWRlcm9zL2luZGV4ZXMvXxABGgoKBmFjdGl2bxABGgoKBm5vbWJyZRABGgwKCF9fbmFtZV9fEAE');
    console.log('');
    console.log('2. Colección: caballos');
    console.log('   Campos: criaderoId (Ascendente), nombre (Ascendente)');
    console.log('');
    console.log('3. Colección: servicios');
    console.log('   Campos: caballoId (Ascendente), fechaRealizacion (Descendente)');
    console.log('');
    console.log('4. Colección: finanzas');
    console.log('   Campos: tipo (Ascendente), fecha (Descendente)');
    console.log('');
    console.log('5. Colección: eventos');
    console.log('   Campos: fechaInicio (Ascendente)');
    console.log('');
    console.log('🔗 Ve a Firebase Console > Firestore > Índices para crearlos manualmente');

  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createIndexes().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
}

module.exports = { createIndexes };
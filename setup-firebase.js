const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCfRLHK7LYa-GJ2wkmb9eU9wMoSP0xE89w",
  authDomain: "gestion-equina.firebaseapp.com",
  projectId: "gestion-equina",
  storageBucket: "gestion-equina.firebasestorage.app",
  messagingSenderId: "197431637538",
  appId: "1:197431637538:web:bf8dca76e88f71a4ebbc7b",
  measurementId: "G-L7HXH99RHH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🚀 Iniciando configuración automática de Firebase...');

async function setupFirebaseDatabase() {
  try {
    console.log('📝 Creando roles del sistema...');

    // Crear roles
    const roles = [
      {
        id: 'admin',
        nombre: 'admin',
        descripcion: 'Acceso completo al sistema',
        createdAt: Timestamp.now()
      },
      {
        id: 'empleado',
        nombre: 'empleado',
        descripcion: 'Acceso limitado a gestión diaria',
        createdAt: Timestamp.now()
      },
      {
        id: 'visitante',
        nombre: 'visitante',
        descripcion: 'Solo lectura básica',
        createdAt: Timestamp.now()
      }
    ];

    for (const role of roles) {
      await setDoc(doc(db, 'roles', role.id), role);
      console.log(`✅ Rol creado: ${role.nombre}`);
    }

    console.log('🏗️ Creando datos iniciales...');

    // Crear criadero de ejemplo
    const criaderoEjemplo = {
      id: 'criadero-ejemplo',
      nombre: 'Criadero Los Álamos',
      descripcion: 'Criadero especializado en caballos de salto',
      direccion: 'Finca Los Álamos, km 15 vía Bogotá',
      telefono: '+5712345678',
      email: 'info@losalamos.com',
      capacidadMaxima: 50,
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'criaderos', criaderoEjemplo.id), criaderoEjemplo);
    console.log('✅ Criadero de ejemplo creado');

    // Crear cliente de ejemplo
    const clienteEjemplo = {
      id: 'cliente-ejemplo',
      nombre: 'María',
      apellido: 'González',
      documentoTipo: 'cedula',
      documentoNumero: '12345678',
      telefono: '+573001234567',
      email: 'maria@email.com',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      tipo: 'particular',
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'clientes', clienteEjemplo.id), clienteEjemplo);
    console.log('✅ Cliente de ejemplo creado');

    // Crear caballo de ejemplo
    const caballoEjemplo = {
      id: 'caballo-ejemplo',
      nombre: 'Rayo',
      nombreCriadero: 'Rayo de Plata',
      fechaNacimiento: '2020-03-15',
      sexo: 'macho',
      raza: 'Pura Sangre Inglés',
      pelaje: 'Alazán',
      propietarioActualId: clienteEjemplo.id,
      criaderoId: criaderoEjemplo.id,
      estado: 'activo',
      observaciones: 'Caballo de competición, excelente saltador',
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'caballos', caballoEjemplo.id), caballoEjemplo);
    console.log('✅ Caballo de ejemplo creado');

    // Crear proveedor de ejemplo
    const proveedorEjemplo = {
      id: 'proveedor-ejemplo',
      nombre: 'Veterinaria Central',
      contacto: 'Dr. Carlos Rodríguez',
      telefono: '+5712345678',
      email: 'contacto@veterinariacentral.com',
      direccion: 'Av. Principal 123',
      tipo: 'veterinario',
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'proveedores', proveedorEjemplo.id), proveedorEjemplo);
    console.log('✅ Proveedor de ejemplo creado');

    // Crear montador de ejemplo
    const montadorEjemplo = {
      id: 'montador-ejemplo',
      nombre: 'Pedro',
      apellido: 'López',
      especialidad: 'Herrador',
      telefono: '+573001234567',
      email: 'pedro@herrero.com',
      tarifaHora: 50000, // en centavos
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'montadores', montadorEjemplo.id), montadorEjemplo);
    console.log('✅ Montador de ejemplo creado');

    // Crear herraje de ejemplo
    const herrajeEjemplo = {
      id: 'herraje-ejemplo',
      nombre: 'Herradura delantera #8',
      tipo: 'herradura',
      descripcion: 'Herradura de acero forjado',
      precioUnitario: 25000, // en centavos
      stockActual: 45,
      stockMinimo: 10,
      proveedorId: proveedorEjemplo.id,
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'herrajes', herrajeEjemplo.id), herrajeEjemplo);
    console.log('✅ Herraje de ejemplo creado');

    // Crear item de inventario de ejemplo
    const inventarioEjemplo = {
      id: 'inventario-ejemplo',
      nombre: 'Vacuna antirrábica',
      descripcion: 'Vacuna para prevención de rabia',
      categoria: 'vacunacion',
      unidadMedida: 'dosis',
      stockActual: 25.5,
      stockMinimo: 5.0,
      precioUnitario: 15000, // en centavos
      proveedorId: proveedorEjemplo.id,
      fechaVencimiento: '2026-01-01',
      ubicacion: 'Refrigerador A-3',
      activo: true,
      createdBy: 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'inventario', inventarioEjemplo.id), inventarioEjemplo);
    console.log('✅ Item de inventario creado');

    // Crear transacción financiera de ejemplo
    const transaccionEjemplo = {
      id: 'transaccion-ejemplo',
      tipo: 'ingreso',
      categoria: 'venta_caballo',
      descripcion: 'Venta de caballo Rayo',
      monto: 50000000, // en centavos
      fecha: '2025-01-20',
      caballoId: caballoEjemplo.id,
      clienteId: clienteEjemplo.id,
      usuarioId: 'system',
      metodoPago: 'transferencia',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'finanzas', transaccionEjemplo.id), transaccionEjemplo);
    console.log('✅ Transacción financiera creada');

    // Crear evento de ejemplo
    const eventoEjemplo = {
      id: 'evento-ejemplo',
      titulo: 'Vacunación anual',
      descripcion: 'Vacunación antirrábica y tétanos',
      tipo: 'veterinario',
      fechaInicio: Timestamp.fromDate(new Date('2025-01-20T10:00:00Z')),
      fechaFin: Timestamp.fromDate(new Date('2025-01-20T11:00:00Z')),
      caballoId: caballoEjemplo.id,
      clienteId: clienteEjemplo.id,
      usuarioId: 'system',
      createdBy: 'system',
      estado: 'pendiente',
      recordatorio: true,
      minutosRecordatorio: 60,
      ubicacion: 'Criadero Los Álamos',
      notas: 'Traer documentación del caballo',
      recurrente: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'eventos', eventoEjemplo.id), eventoEjemplo);
    console.log('✅ Evento de ejemplo creado');

    console.log('\n🎉 ¡Configuración de Firebase completada exitosamente!');
    console.log('\n📋 Resumen de datos creados:');
    console.log('   • 3 roles del sistema');
    console.log('   • 1 criadero de ejemplo');
    console.log('   • 1 cliente de ejemplo');
    console.log('   • 1 caballo de ejemplo');
    console.log('   • 1 proveedor de ejemplo');
    console.log('   • 1 montador de ejemplo');
    console.log('   • 1 herraje de ejemplo');
    console.log('   • 1 item de inventario');
    console.log('   • 1 transacción financiera');
    console.log('   • 1 evento de ejemplo');

    console.log('\n⚠️  PASOS MANUALES PENDIENTES:');
    console.log('1. Configurar Security Rules en Firebase Console');
    console.log('2. Configurar Storage buckets y reglas');
    console.log('3. Desplegar Cloud Functions (si las necesitas)');
    console.log('4. Configurar Firebase Authentication');

    console.log('\n🔗 Enlaces importantes:');
    console.log('• Firebase Console: https://console.firebase.google.com');
    console.log('• Documentación: https://firebase.google.com/docs');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar configuración
setupFirebaseDatabase().then(() => {
  console.log('\n✅ Script completado. Revisa los datos en Firebase Console.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
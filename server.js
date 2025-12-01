// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const DB_PATH = process.env.DB_PATH || './gestion-equina.db';

// Enforce secure configuration in production
if (NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production')) {
  console.error('FATAL: JWT_SECRET not set or is using the default. Set process.env.JWT_SECRET in production.');
  process.exit(1);
}

// Dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Validation helpers (built-in for now)
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateRequired = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const validateNumber = (value) => !isNaN(Number(value)) && Number(value) >= 0;
const validateDate = (dateString) => !isNaN(Date.parse(dateString));
const sanitizeString = (str) => String(str).trim().replace(/[<>]/g, '');

const app = express();
// `PORT` y `JWT_SECRET` ya se declaran arriba a partir de las variables de entorno.
// No redeclarar aquí.

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de payload

// Rate limiting básico (sin dependencias externas por ahora)
const requestCounts = new Map();
setInterval(() => requestCounts.clear(), 15 * 60 * 1000); // Limpiar cada 15 minutos

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - (15 * 60 * 1000); // 15 minutos

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }

  const requests = requestCounts.get(clientIP);
  // Limpiar requests antiguos
  const recentRequests = requests.filter(time => time > windowStart);

  if (recentRequests.length >= 100) { // 100 requests por 15 minutos
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Inténtalo más tarde.'
    });
  }

  recentRequests.push(now);
  requestCounts.set(clientIP, recentRequests);
  next();
});

// Middleware de validación
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && !validateRequired(value)) {
        errors.push(`${field} es requerido`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type === 'email' && !validateEmail(value)) {
          errors.push(`${field} debe ser un email válido`);
        } else if (rules.type === 'number' && !validateNumber(value)) {
          errors.push(`${field} debe ser un número válido`);
        } else if (rules.type === 'date' && !validateDate(value)) {
          errors.push(`${field} debe ser una fecha válida`);
        }

        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} debe ser menor o igual a ${rules.max}`);
        }

        if (rules.sanitize) {
          req.body[field] = sanitizeString(value);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors
      });
    }

    next();
  };
};

// Sistema de logging avanzado
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    // Console logging
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, Object.keys(meta).length ? meta : '');

    // File logging
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  }

  info(message, meta) { this.log('info', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  error(message, meta) { this.log('error', message, meta); }
}

// Métricas de monitoreo
const metrics = {
  requests: 0,
  errors: 0,
  responseTime: [],
  startTime: Date.now()
};

const logger = new Logger();

// Middleware de logging y monitoreo
app.use((req, res, next) => {
  const startTime = Date.now();
  metrics.requests++;

  // Loggear respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    metrics.responseTime.push(duration);

    // Mantener solo las últimas 100 mediciones
    if (metrics.responseTime.length > 100) {
      metrics.responseTime.shift();
    }

    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      metrics.errors++;
      logger.warn('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }

    originalSend.call(this, data);
  };

  next();
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  if (!res.headersSent) {
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ha ocurrido un error inesperado'
    });
  }
});

// Base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

// Inicializar tablas
function initDatabase() {
  db.serialize(() => {
    // Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    // Criaderos
    db.run(`CREATE TABLE IF NOT EXISTS criaderos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      ubicacion TEXT,
      descripcion TEXT,
      propietario TEXT,
      telefono TEXT,
      email TEXT
    )`);

    // Caballos
    db.run(`CREATE TABLE IF NOT EXISTS caballos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      criaderoId INTEGER,
      raza TEXT,
      edad INTEGER,
      sexo TEXT,
      color TEXT,
      fechaNacimiento TEXT,
      padreId INTEGER,
      madreId INTEGER,
      estadoSalud TEXT,
      peso REAL,
      altura REAL,
      propietario TEXT,
      entrenador TEXT,
      competiciones INTEGER,
      victorias INTEGER,
      ultimaRevision TEXT,
      FOREIGN KEY (criaderoId) REFERENCES criaderos(id)
    )`);

    // Eventos
    db.run(`CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      fecha TEXT,
      criaderoId INTEGER,
      tipo TEXT,
      descripcion TEXT,
      ubicacion TEXT,
      participantes TEXT,
      costo REAL,
      duracionHoras REAL,
      responsable TEXT,
      notas TEXT,
      estado TEXT,
      FOREIGN KEY (criaderoId) REFERENCES criaderos(id)
    )`);

    // Transacciones Financieras
    db.run(`CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      criaderoId INTEGER,
      tipo TEXT,
      categoria TEXT,
      descripcion TEXT,
      monto REAL,
      fecha TEXT,
      caballoId INTEGER,
      eventoId INTEGER,
      proveedor TEXT,
      metodoPago TEXT,
      comprobante TEXT,
      notas TEXT,
      usuarioId INTEGER,
      FOREIGN KEY (criaderoId) REFERENCES criaderos(id),
      FOREIGN KEY (caballoId) REFERENCES caballos(id),
      FOREIGN KEY (eventoId) REFERENCES eventos(id)
    )`);

    // Insertar usuario por defecto
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('1234', salt);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
      ['admin', hash, 'admin']);

    // Insertar datos de ejemplo
    db.run(`INSERT OR IGNORE INTO criaderos (id, nombre, ubicacion) VALUES (1, 'Criadero El Potrillo', 'Bogotá')`);
    db.run(`INSERT OR IGNORE INTO caballos (id, nombre, criaderoId, raza, edad, sexo) VALUES (1, 'Relámpago', 1, 'Pura Sangre', 5, 'macho')`);
  });
}

// Endpoints de monitoreo (sin autenticación para que herramientas de monitoreo puedan acceder)
app.get('/health', (req, res) => {
  // Verificar conectividad a BD
  db.get('SELECT 1', (err) => {
    const health = {
      status: err ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: err ? 'disconnected' : 'connected',
      version: '1.0.0'
    };

    res.status(err ? 503 : 200).json(health);
  });
});

app.get('/metrics', (req, res) => {
  const avgResponseTime = metrics.responseTime.length > 0
    ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
    : 0;

  const metricsData = {
    requests_total: metrics.requests,
    errors_total: metrics.errors,
    response_time_avg_ms: Math.round(avgResponseTime),
    uptime_seconds: Math.round(process.uptime()),
    memory_usage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  res.json(metricsData);
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Access attempt without token', { ip: req.ip, path: req.path });
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token', { ip: req.ip, path: req.path, error: err.message });
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Esquemas de validación
const loginSchema = {
  username: { required: true, sanitize: true },
  password: { required: true }
};

const caballoSchema = {
  nombre: { required: true, sanitize: true },
  criaderoId: { required: true, type: 'number', min: 1 },
  raza: { sanitize: true },
  edad: { type: 'number', min: 0, max: 50 },
  sexo: { required: true, sanitize: true },
  color: { sanitize: true },
  propietario: { sanitize: true }
};

const eventoSchema = {
  nombre: { required: true, sanitize: true },
  fecha: { required: true, type: 'date' },
  criaderoId: { required: true, type: 'number', min: 1 },
  tipo: { sanitize: true },
  descripcion: { sanitize: true },
  ubicacion: { sanitize: true },
  costo: { type: 'number', min: 0 },
  duracionHoras: { type: 'number', min: 0 },
  responsable: { sanitize: true },
  notas: { sanitize: true },
  estado: { sanitize: true }
};

const transaccionSchema = {
  criaderoId: { required: true, type: 'number', min: 1 },
  tipo: { required: true, sanitize: true },
  categoria: { required: true, sanitize: true },
  descripcion: { required: true, sanitize: true },
  monto: { required: true, type: 'number', min: 0 },
  fecha: { required: true, type: 'date' },
  proveedor: { sanitize: true },
  metodoPago: { sanitize: true },
  notas: { sanitize: true }
};

// Rutas de autenticación
app.post('/api/auth/login', validateRequest(loginSchema), (req, res) => {
  const { username, password } = req.body;

  // Validar longitud mínima de contraseña
  if (password.length < 4) {
    return res.status(400).json({
      error: 'Contraseña inválida',
      message: 'La contraseña debe tener al menos 4 caracteres'
    });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      logger.error('Database error during login', {
        error: err.message,
        username,
        ip: req.ip
      });
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al procesar la solicitud'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario no encontrado'
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      accessToken: token,
      user: { username: user.username, role: user.role }
    });
  });
});

// Rutas de criaderos
app.get('/api/criaderos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM criaderos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rutas de caballos
app.get('/api/caballos', authenticateToken, (req, res) => {
  const { criaderoId } = req.query;
  let query = 'SELECT * FROM caballos';
  let params = [];

  if (criaderoId) {
    query += ' WHERE criaderoId = ?';
    params = [criaderoId];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/caballos', authenticateToken, validateRequest(caballoSchema), (req, res) => {
  const { nombre, criaderoId, raza, edad, sexo, color, propietario } = req.body;

  // Verificar que el criadero existe
  db.get('SELECT id FROM criaderos WHERE id = ?', [criaderoId], (err, criadero) => {
    if (err) {
      console.error('Database error checking criadero:', err);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al verificar criadero'
      });
    }

    if (!criadero) {
      return res.status(400).json({
        error: 'Criadero no encontrado',
        message: 'El criadero especificado no existe'
      });
    }

    db.run(`INSERT INTO caballos (nombre, criaderoId, raza, edad, sexo, color, propietario, estadoSalud, fechaNacimiento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, criaderoId, raza, edad, sexo, color, propietario, 'saludable', new Date().toISOString()],
      function(err) {
        if (err) {
          console.error('Database error creating caballo:', err);
          return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error al crear caballo'
          });
        }
        res.status(201).json({
          id: this.lastID,
          message: 'Caballo creado exitosamente'
        });
      });
  });
});

// Rutas básicas para otras entidades (montadores, herrajes, etc.)
app.get('/api/montadores', authenticateToken, (req, res) => {
  // Implementación básica - en producción usar tabla real
  res.json([
    { id: 1, nombre: 'Juan', apellido: 'Pérez', especialidad: 'jinete' },
    { id: 2, nombre: 'María', apellido: 'García', especialidad: 'entrenador' }
  ]);
});

app.get('/api/herrajes', authenticateToken, (req, res) => {
  res.json([
    { id: 1, nombre: 'Herradura estándar', tipo: 'herradura', stock: 50, precio: 25000 },
    { id: 2, nombre: 'Clavos de herradura', tipo: 'clavo', stock: 20, precio: 15000 }
  ]);
});

// Rutas de eventos
app.get('/api/eventos', authenticateToken, (req, res) => {
  const { criaderoId } = req.query;
  let query = 'SELECT * FROM eventos';
  let params = [];

  if (criaderoId) {
    query += ' WHERE criaderoId = ?';
    params = [criaderoId];
  }

  query += ' ORDER BY fecha DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/eventos', authenticateToken, validateRequest(eventoSchema), (req, res) => {
  const { nombre, fecha, criaderoId, tipo, descripcion, ubicacion, participantes, costo, duracionHoras, responsable, notas, estado } = req.body;

  // Verificar que el criadero existe
  db.get('SELECT id FROM criaderos WHERE id = ?', [criaderoId], (err, criadero) => {
    if (err) {
      console.error('Database error checking criadero:', err);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al verificar criadero'
      });
    }

    if (!criadero) {
      return res.status(400).json({
        error: 'Criadero no encontrado',
        message: 'El criadero especificado no existe'
      });
    }

    // Validar participantes si se proporcionan
    let participantesJSON = null;
    if (participantes) {
      try {
        if (Array.isArray(participantes)) {
          participantesJSON = JSON.stringify(participantes);
        } else {
          return res.status(400).json({
            error: 'Participantes inválidos',
            message: 'Los participantes deben ser un array de IDs'
          });
        }
      } catch (e) {
        return res.status(400).json({
          error: 'Participantes inválidos',
          message: 'Formato de participantes incorrecto'
        });
      }
    }

    db.run(`INSERT INTO eventos (nombre, fecha, criaderoId, tipo, descripcion, ubicacion, participantes, costo, duracionHoras, responsable, notas, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, fecha, criaderoId, tipo || 'otro', descripcion, ubicacion, participantesJSON, costo, duracionHoras, responsable, notas, estado || 'programado'],
      function(err) {
        if (err) {
          console.error('Database error creating evento:', err);
          return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error al crear evento'
          });
        }
        res.status(201).json({
          id: this.lastID,
          message: 'Evento creado exitosamente'
        });
      });
  });
});

app.put('/api/eventos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombre, fecha, tipo, descripcion, ubicacion, participantes, costo, duracionHoras, responsable, notas, estado } = req.body;

  db.run(`UPDATE eventos SET nombre = ?, fecha = ?, tipo = ?, descripcion = ?, ubicacion = ?, participantes = ?, costo = ?, duracionHoras = ?, responsable = ?, notas = ?, estado = ? WHERE id = ?`,
    [nombre, fecha, tipo, descripcion, ubicacion, participantes ? JSON.stringify(participantes) : null, costo, duracionHoras, responsable, notas, estado, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json({ message: 'Evento actualizado' });
    });
});

app.delete('/api/eventos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM eventos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado' });
  });
});

// Rutas de Transacciones Financieras
app.get('/api/transacciones', authenticateToken, (req, res) => {
  const { criaderoId, fechaInicio, fechaFin } = req.query;
  let query = 'SELECT * FROM transacciones WHERE 1=1';
  let params = [];

  if (criaderoId) {
    query += ' AND criaderoId = ?';
    params.push(criaderoId);
  }

  if (fechaInicio) {
    query += ' AND fecha >= ?';
    params.push(fechaInicio);
  }

  if (fechaFin) {
    query += ' AND fecha <= ?';
    params.push(fechaFin);
  }

  query += ' ORDER BY fecha DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/transacciones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM transacciones WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(row);
  });
});

app.post('/api/transacciones', authenticateToken, validateRequest(transaccionSchema), (req, res) => {
  const { criaderoId, tipo, categoria, descripcion, monto, fecha, caballoId, eventoId, proveedor, metodoPago, comprobante, notas } = req.body;

  // Validar tipos permitidos
  const tiposPermitidos = ['ingreso', 'egreso'];
  const categoriasPermitidas = ['alimentacion', 'veterinaria', 'herraje', 'competicion', 'venta', 'compra', 'mantenimiento', 'salario', 'otro'];

  if (!tiposPermitidos.includes(tipo)) {
    return res.status(400).json({
      error: 'Tipo inválido',
      message: `Tipo debe ser uno de: ${tiposPermitidos.join(', ')}`
    });
  }

  if (!categoriasPermitidas.includes(categoria)) {
    return res.status(400).json({
      error: 'Categoría inválida',
      message: `Categoría debe ser una de: ${categoriasPermitidas.join(', ')}`
    });
  }

  // Verificar que el criadero existe
  db.get('SELECT id FROM criaderos WHERE id = ?', [criaderoId], (err, criadero) => {
    if (err) {
      console.error('Database error checking criadero:', err);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al verificar criadero'
      });
    }

    if (!criadero) {
      return res.status(400).json({
        error: 'Criadero no encontrado',
        message: 'El criadero especificado no existe'
      });
    }

    // Verificar caballo si se especifica
    if (caballoId) {
      db.get('SELECT id FROM caballos WHERE id = ?', [caballoId], (err, caballo) => {
        if (err) {
          console.error('Database error checking caballo:', err);
          return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error al verificar caballo'
          });
        }

        if (!caballo) {
          return res.status(400).json({
            error: 'Caballo no encontrado',
            message: 'El caballo especificado no existe'
          });
        }

        insertTransaction();
      });
    } else {
      insertTransaction();
    }

    function insertTransaction() {
      db.run(`INSERT INTO transacciones (criaderoId, tipo, categoria, descripcion, monto, fecha, caballoId, eventoId, proveedor, metodoPago, comprobante, notas, usuarioId)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [criaderoId, tipo, categoria, descripcion, monto, fecha, caballoId, eventoId, proveedor, metodoPago, comprobante, notas, req.user.id],
        function(err) {
          if (err) {
            console.error('Database error creating transaccion:', err);
            return res.status(500).json({
              error: 'Error interno del servidor',
              message: 'Error al crear transacción'
            });
          }
          res.status(201).json({
            id: this.lastID,
            message: 'Transacción creada exitosamente'
          });
        });
    }
  });
});

app.put('/api/transacciones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { tipo, categoria, descripcion, monto, fecha, caballoId, eventoId, proveedor, metodoPago, comprobante, notas } = req.body;

  db.run(`UPDATE transacciones SET tipo = ?, categoria = ?, descripcion = ?, monto = ?, fecha = ?, caballoId = ?, eventoId = ?, proveedor = ?, metodoPago = ?, comprobante = ?, notas = ? WHERE id = ?`,
    [tipo, categoria, descripcion, monto, fecha, caballoId, eventoId, proveedor, metodoPago, comprobante, notas, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transacción no encontrada' });
      res.json({ message: 'Transacción actualizada' });
    });
});

app.delete('/api/transacciones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM transacciones WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json({ message: 'Transacción eliminada' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
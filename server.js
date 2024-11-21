// server.js

const http = require('http');
const url = require('url');

let users = []; // Array en memoria para almacenar usuarios

// Función para manejar el registro de logs
const logRequest = (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
};

// Función para generar una respuesta JSON
const sendJSON = (res, statusCode, message) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(message));
};

// Función para validar el cuerpo de una solicitud POST/PUT
const validateUserData = (data) => {
  if (!data.name || !data.email) {
    return { valid: false, message: 'El nombre y el correo son requeridos' };
  }
  return { valid: true };
};

// Función para encontrar un usuario por ID
const findUserById = (id) => users.find((user) => user.id === id);

const requestHandler = (req, res) => {
  logRequest(req); // Registrar la solicitud

  const parsedUrl = url.parse(req.url, true); // Parsear la URL y los parámetros de consulta
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Endpoint: GET /api/hello/{name}
  if (pathname.startsWith('/api/hello/') && method === 'GET') {
    const name = pathname.split('/')[3];
    return sendJSON(res, 200, { message: `¡Hola, ${name}!` });
  }

  // Endpoint: GET /api/users/{id}
  if (pathname.startsWith('/api/users/') && method === 'GET') {
    const userId = pathname.split('/')[3];
    const user = findUserById(userId);
    if (!user) {
      return sendJSON(res, 404, { message: 'Usuario no encontrado' });
    }
    return sendJSON(res, 200, user);
  }

  // Endpoint: POST /api/users
  if (pathname === '/api/users' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const validation = validateUserData(userData);

        if (!validation.valid) {
          return sendJSON(res, 400, { message: validation.message });
        }

        // Crear el usuario
        const newUser = { 
          id: (users.length + 1).toString(),
          name: userData.name,
          email: userData.email
        };
        users.push(newUser);
        return sendJSON(res, 201, newUser);
      } catch (error) {
        return sendJSON(res, 400, { message: 'Error en el formato de los datos' });
      }
    });
  }

  // Endpoint: PUT /api/users/{id}
  if (pathname.startsWith('/api/users/') && method === 'PUT') {
    const userId = pathname.split('/')[3];
    const user = findUserById(userId);

    if (!user) {
      return sendJSON(res, 404, { message: 'Usuario no encontrado' });
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const validation = validateUserData(userData);

        if (!validation.valid) {
          return sendJSON(res, 400, { message: validation.message });
        }

        // Actualizar el usuario
        user.name = userData.name;
        user.email = userData.email;
        return sendJSON(res, 200, user);
      } catch (error) {
        return sendJSON(res, 400, { message: 'Error en el formato de los datos' });
      }
    });
  }

  // Endpoint: DELETE /api/users/{id}
  if (pathname.startsWith('/api/users/') && method === 'DELETE') {
    const userId = pathname.split('/')[3];
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return sendJSON(res, 404, { message: 'Usuario no encontrado' });
    }

    // Eliminar el usuario
    users.splice(userIndex, 1);
    return sendJSON(res, 204, { message: 'Usuario eliminado' });
  }

  // Si la ruta no existe
  return sendJSON(res, 404, { message: 'Ruta no encontrada' });
};

// Crear el servidor HTTP
const server = http.createServer(requestHandler);

// Iniciar el servidor
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

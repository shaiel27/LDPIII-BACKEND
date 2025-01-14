import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log('Received token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(401).json({ error: "Token inválido" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Acceso denegado. Solo para administradores." });
  }
  next();
};

export const verifyWorker = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: "Acceso denegado. Solo para trabajadores." });
  }
  next();
};


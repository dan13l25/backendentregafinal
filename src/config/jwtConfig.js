import jwt from "jsonwebtoken";
import { PRIVATE_KEY } from "../utils.js";

export const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.jwtToken;

    const token = authHeader ? authHeader.split(" ")[1] : cookieToken;

    if (!token) {
        return res.status(401).send({ status: "error", message: "No autorizado" });
    }

    jwt.verify(token, PRIVATE_KEY, (error, user) => {
        if (error) {
            console.error('JWT Verification Error:', error);
            return res.status(401).send({ status: "error", message: "No autorizado" });
        }

        req.user = user;
        next();
    });
};

export const generateToken = (user) => {
    const token = jwt.sign({ _id: user._id }, PRIVATE_KEY, { expiresIn: "1h" });
    return token;
};

export const isUser = (req, res, next) => {
  if(req.user && req.user.role === 'user') {
      next();
  } 
  else {
      return res.status(403).json({ error: 'Acceso no autorizado' });
  }
}
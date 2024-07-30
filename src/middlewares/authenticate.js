import jwt from 'jsonwebtoken';
import { PRIVATE_KEY } from '../utils.js';
import userRepository from "../dao/repositories/userRepositorie.js";

export const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado." });
    }

    try {
        const decoded = jwt.verify(token, PRIVATE_KEY);
        const user = await userRepository.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado." });
        }

        req.userId = user._id;
        req.session.user = user; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido." });
    }
};
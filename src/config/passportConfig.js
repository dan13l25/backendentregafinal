import passport from "passport";
import local from "passport-local";
import userModel from "../dao/models/users.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PRIVATE_KEY, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } from "../utils.js";
import { CustomError } from "../utils/customError.js"; 
import { errorTypes } from "../utils/errorTypes.js";  

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true, 
        usernameField: "email"
    }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
            const user = await userModel.findOne({ email });
            if (user) {
                console.log("Usuario ya existe");
                return done(null, false, CustomError.createError({
                    name: "UserExistsError",
                    message: "Usuario ya existe",
                    code: errorTypes.ERROR_FORBIDDEN,
                    description: `User with email ${email} already exists`
                }));
            }
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: "user"
            };
            const result = await userModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(CustomError.createError({
                name: "RegisterError",
                message: "Error al registrar usuario",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));  
        }
    }));

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await userModel.findOne({ email });
            if (!user) {
                return done(null, false, CustomError.createError({
                    name: "UserNotFoundError",
                    message: "Usuario no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `User with email ${email} not found`
                }));
            }
            const valid = isValidPassword(user, password);
            if (!valid) {
                return done(null, false, CustomError.createError({
                    name: "InvalidPasswordError",
                    message: "Contraseña incorrecta",
                    code: errorTypes.ERROR_UNAUTHORIZED,
                    description: "Password does not match"
                }));
            }
            return done(null, user);
        } catch (error) {
            return done(CustomError.createError({
                name: "LoginError",
                message: "Error al iniciar sesión",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }));

    passport.use("github", new GitHubStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            const user = await userModel.findOne({ email: profile._json.email });
            if (!user) {
                const newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 20,
                    email: profile._json.email,
                    password: "",
                };
                let createdUser = await userModel.create(newUser);
                done(null, createdUser);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(CustomError.createError({
                name: "GitHubAuthError",
                message: "Error en la autenticación con GitHub",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }));

    passport.use("current", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies["jwtToken"]]),
        secretOrKey: PRIVATE_KEY,
    }, async (payload, done) => {
        try {
            const user = await userModel.findById(payload._id);
            if (!user) {
                return done(null, false, CustomError.createError({
                    name: "UserNotFoundError",
                    message: "Usuario no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `User with id ${payload._id} not found`
                }));
            }
            return done(null, user);
        } catch (error) {
            return done(CustomError.createError({
                name: "JWTAuthError",
                message: "Error en la autenticación con JWT",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }), false);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            if (!user) {
                return done(null, false, CustomError.createError({
                    name: "UserNotFoundError",
                    message: "Usuario no encontrado",
                    code: errorTypes.ERROR_NOT_FOUND,
                    description: `User with id ${id} not found`
                })); 
            }
            return done(null, user);
        } catch (error) {
            return done(CustomError.createError({
                name: "DeserializeError",
                message: "Error al deserializar usuario",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    });
};

export default initializePassport;

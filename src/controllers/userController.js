import UserService from "../dao/services/userService.js";
import { errorTypes } from "../utils/errorTypes.js";
import { CustomError } from "../utils/customError.js";

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async getLogin(req, res, next) {
        try {
            const loginView = await this.userService.getLogin();
            res.render(loginView);
        } catch (error) {
            req.logger.error("Error al obtener la vista de inicio de sesión:", error.message);
            next(CustomError.createError({
                name: "GetLoginError",
                message: "Error al obtener la vista de inicio de sesión",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        try {
            const { user, access_token } = await this.userService.login(email, password);
            req.session.token = access_token;
            req.session.userId = user._id;
            req.session.user = {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                age: user.age,
                role: user.role
            };
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            res.status(200  ).json({ message: "Inicio de sesión exitoso", access_token });
        } catch (error) {
            req.logger.error("Error al iniciar sesión:", error.message);
            next(CustomError.createError({
                name: "LoginError",
                message: "Error al iniciar sesión",
                code: errorTypes.ERROR_AUTHENTICATION,
                description: error.message
            }));
        }
    }

    async getRegister(req, res, next) {
        try {
            const registerView = await this.userService.getRegister();
            res.render(registerView);
        } catch (error) {
            req.logger.error("Error al obtener la vista de registro:", error.message);
            next(CustomError.createError({
                name: "GetRegisterError",
                message: "Error al obtener la vista de registro",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async register(req, res, next) {
        const userData = req.body;
        const profileImagePath = req.file ? req.file.path : null;

        // Validación de edad negativa
        if (userData.age < 0) {
            req.logger.error("Error: La edad no puede ser un número negativo");
            return next(CustomError.createError({
                name: "RegisterError",
                message: "La edad no puede ser un número negativo",
                code: errorTypes.ERROR_VALIDATION,
                description: "La edad proporcionada es negativa"
            }));
        }

        try {
            console.log('Registering user with data:', userData);
            const { newUser, access_token } = await this.userService.register(req, userData, profileImagePath);
            
            req.session.token = access_token;
            req.session.userId = newUser._id;
            req.session.user = {
                name: `${newUser.first_name} ${newUser.last_name}`,
                email: newUser.email,
                age: newUser.age,
                role: newUser.role
            };
            
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            
            res.status(200).render('registerSuccess', { newUser, message: "Registro exitoso" });
        } catch (error) {
            req.logger.error("Error al registrar usuario:", error.message);
            console.error("Detailed error during registration:", error);
            next(CustomError.createError({
                name: "RegisterError",
                message: "Error al registrar usuario",
                code: errorTypes.ERROR_AUTHENTICATION,
                description: error.message
            }));
        }
    }

    

    async restorePassword(req, res, next) {
        const { email, password } = req.body;
        try {
            const message = await this.userService.restorePassword(email, password);
            res.json({ message });
        } catch (error) {
            req.logger.error("Error al restaurar la contraseña:", error.message);
            next(CustomError.createError({
                name: "RestorePasswordError",
                message: "Error al restaurar la contraseña",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async logOut(req, res, next) {
        try {
            await this.userService.logOut(req, res);
        } catch (error) {
            req.logger.error("Error al cerrar sesión:", error.message);
            next(CustomError.createError({
                name: "LogOutError",
                message: "Error al cerrar sesión",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async requestPasswordReset(req, res, next) {
        const { email } = req.body;
        try {
            const message = await this.userService.requestPasswordReset(email);
            res.json({ message });
        } catch (error) {
            req.logger.error("Error al solicitar restablecimiento de contraseña:", error.message);
            next(CustomError.createError({
                name: "RequestPasswordResetError",
                message: "Error al solicitar restablecimiento de contraseña",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async resetPassword(req, res, next) {
        const { token, newPassword } = req.body;
        try {
            const message = await this.userService.resetPassword(token, newPassword);
            res.json({ message });
        } catch (error) {
            req.logger.error("Error al restablecer la contraseña:", error.message);
            next(CustomError.createError({
                name: "ResetPasswordError",
                message: "Error al restablecer la contraseña",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async uploadDocuments(req, res, next) {
        const userId = req.params.uid;  
        const documents = req.files;    
        try {
            const updatedUser = await this.userService.uploadDocuments(userId, documents);
            res.json({ updatedUser });
            res.status(200).json({ message: 'Documentos subidos exitosamente' });
        } catch (error) {
            req.logger.error("Error al actualizar documentos:", error.message);
            next(CustomError.createError({
                name: 'UploadError',
                message: 'Error al subir documentos',
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async upgradeToPremium(req, res, next) {
        const { userId } = req.params;
        try {
            const user = await this.userService.upgradeToPremium(userId);
            res.json({ user });
        } catch (error) {
            req.logger.error("Error al actualizar usuario a premium:", error.message);
            next(CustomError.createError({
                name: "UpgradeToPremiumError",
                message: "Error al actualizar usuario a premium",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            req.logger.error("Error al obtener todos los usuarios:", error.message);
            next(CustomError.createError({
                name: "GetAllUsersError",
                message: "Error al obtener todos los usuarios",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async deleteInactiveUsers(req, res, next) {
        try {
            const result = await this.userService.deleteInactiveUsers();
            res.json(result);
        } catch (error) {
            req.logger.error("Error al eliminar usuarios inactivos:", error.message);
            next(CustomError.createError({
                name: "DeleteInactiveUsersError",
                message: "Error al eliminar usuarios inactivos",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }

    async updateUserRole(req, res, next) {
        const { userId } = req.params;
        const { role } = req.body;
        try {
            const user = await this.userService.updateUserRole(userId, role);
            res.json({ user });
        } catch (error) {
            req.logger.error("Error al actualizar rol de usuario:", error.message);
            next(CustomError.createError({
                name: "UpdateUserRoleError",
                message: "Error al actualizar rol de usuario",
                code: errorTypes.ERROR_INTERNAL_ERROR,
                description: error.message
            }));
        }
    }
}

export default UserController;

import userModel from "../models/users.js";

const userRepository = {
    findByEmail: async ( email) => {
        try {
            const user = await userModel.findOne({  email: email });
            return user;
        } catch (error) {
            req.logger.error("Error al buscar usuario por correo electrónico:", error.message);
            throw new Error("Error al buscar usuario por correo electrónico: " + error.message);
        }
    },

    findById: async (req, userId, useLean = false) => {
        try {
            if (useLean) {
                const user = await userModel.findById(userId).lean();
                return user;
            } else {
                const user = await userModel.findById(userId).populate('createdProducts');
                return user;
            }
        } catch (error) {
            req.logger.error("Error al buscar usuario por ID:", error.message);
            throw new Error("Error al buscar usuario por ID: " + error.message);
        }
    },    

    createUser: async (req, userData) => {
        try {
            const newUser = new userModel(userData);
            await newUser.save();
            return newUser;
        } catch (error) {
            req.logger.error("error al crear usuario",error.message)
            throw new Error("Error al crear usuario: " + error.message);
        }
    },

    uploadDocuments: async (req, user, documents) => {
         try {
            user.documents = [...user.documents, ...documents];
            await user.save();
            return user;
        } catch (error) {
            req.logger.error("Error al actualizar documentos:", error.message);
            throw error;
        }
    },


    findAll: async () => {
        try {
            const users = await userModel.find({}, 'first_name last_name email role');
            return users;
        } catch (error) {
            throw new Error("Error al obtener todos los usuarios: " + error.message);
        }
    },
    
    deleteInactive: async () => {
        try {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const usersToDelete = await userModel.find({ last_connection: { $lt: twoDaysAgo } });

            for (const user of usersToDelete) {
                const mailOptions = {
                    to: user.email,
                    from: EMAIL_USERNAME,
                    subject: 'Cuenta eliminada por inactividad',
                    text: `Tu cuenta ha sido eliminada debido a inactividad por más de 2 días.`
                };
                await transporter.sendMail(mailOptions);
            }

            const result = await userModel.deleteMany({ last_connection: { $lt: twoDaysAgo } });
            return { message: "Usuarios inactivos eliminados", result };
        } catch (error) {
            throw new Error("Error al eliminar usuarios inactivos: " + error.message);
        }
    },

    updateRole: async (userId, role) => {
        try {
            const user = await userModel.findById(userId);
            if (!user) {
                throw new Error("Usuario no encontrado");
            }
            user.role = role;
            await user.save();
            return user;
        } catch (error) {
            throw new Error("Error al actualizar rol de usuario: " + error.message);
        }
    }
};

export default userRepository;

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import path from 'path';
import multer from "multer"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });  


export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => {
    console.log(`Datos a validar: user-password: ${user.password}, password: ${password}`);
    return bcrypt.compareSync(password, user.password);
};

export function configureMulter(folder) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, 'public', folder));
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });

    return multer({ storage });
}

export const configureDocumentMulter = () => configureMulter('documents');
export const configureProductMulter = () => configureMulter('products');
export const configureProfileMulter = () => configureMulter('profiles');

export default __dirname;
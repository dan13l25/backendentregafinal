import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    port: 587,
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
    }
})

transporter.verify().then(() => {
}).catch(error => {
    console.error("Error en la configuración del transporte:", error);
}); 
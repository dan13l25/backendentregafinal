const form = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);

    fetch("/api/users/register", {
        method: "POST",
        body: data,
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else {
            errorMessage.textContent = 'Este email ya es un usuario. Logueate';
            errorMessage.style.display = 'block';
            throw new Error('Error al registrarse');
        }
    }) 
    .then(data => {
        const token = data.access_token;
        const userId = data.userId;
        const userRole = data.userRole;

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRole', userRole)

        console.log("Token:", token);
        console.log("Registro exitoso!");
        console.log("User Id:", userId);
        console.log("user rol:", userRole)

        window.location.href = "http://localhost:8080/api/products/";
    })
    .catch(error => {
        console.error('Error en el registro:', error);
    });
});

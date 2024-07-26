const form = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
  
    fetch('/api/users/register', {
      method: "POST",
      body: data,
    })
    .then(response => {
      console.log('Response:', response);
      if (response.status === 200) {
        window.location.href = "/api/users/login";
      } else {
        errorMessage.textContent = 'Este email ya es un usuario. Logueate';
        errorMessage.style.display = 'block';
        return Promise.reject(new Error('Error al registrarse'));
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
  
      window.location.href = "/api/users/login";
    })
    .catch(error => {
        console.error('Error en el registro:', error);
        if (error.message === 'Error al registrarse: El usuario ya existe') {
          errorMessage.textContent = 'Este email ya es un usuario. Logueate';
        } else {
          errorMessage.textContent = 'Error en el registro: ' + error.message;
        }
        errorMessage.style.display = 'block';
      });
  });
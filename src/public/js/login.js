const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {

  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  
  fetch("/api/users/login", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    console.log('Response:', response);
    if (response.status === 200) {
        localStorage.setItem('username', obj.username);
        window.location.replace("/chat");
    } else {
      console.log("algo salio mal");
    }
  });
});
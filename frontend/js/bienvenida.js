// Importa la función para mostrar alertas (visual y accesible)
import { mostrarAlerta } from './alertas.js';

// Agrega un listener al botón con ID 'btnEnviar'
document.getElementById('btnEnviar').addEventListener('click', function() {
    // Obtiene el valor del input de nombre
    const nombreInput = document.getElementById('nombreUsuario');
    let nombre = nombreInput.value.trim(); // Elimina espacios antes/después

    // Validación: el campo no puede estar vacío
    if (nombre === '') {
        mostrarAlerta('El nombre no puede estar vacío.', 'danger');
        return;
    }

    // Validación: el nombre debe contener solo letras sin espacios ni símbolos
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
    if (!regex.test(nombre)) {
        mostrarAlerta('El nombre solo puede contener letras (sin espacios ni caracteres especiales).', 'danger');
        return;
    }

    // Convierte el nombre a mayúsculas
    nombre = nombre.toUpperCase();

    // Guarda el nombre en localStorage para uso posterior
    localStorage.setItem('nombreUsuario', nombre);

    // Redirige a la página de productos
    window.location.href = './productos.html';
});
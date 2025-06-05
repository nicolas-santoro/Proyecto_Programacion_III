document.getElementById('btnEnviar').addEventListener('click', function() {
    const nombreInput = document.getElementById('nombreUsuario');
    let nombre = nombreInput.value.trim();

    // Validación: no vacío
    if (nombre === '') {
        mostrarAlerta('El nombre no puede estar vacío.', 'danger');

        return;
    }

    // Validación: solo letras (sin espacios, sin números ni caracteres especiales)
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
    if (!regex.test(nombre)) {
        mostrarAlerta('El nombre solo puede contener letras (sin espacios ni caracteres especiales).', 'warning');

        return;
    }

    // Convertir a mayúsculas
    nombre = nombre.toUpperCase();

    // Guardar en localStorage
    localStorage.setItem('nombreUsuario', nombre);

    // Redirigir
    window.location.href = './productos.html';
});

function mostrarAlerta(mensaje, tipo) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;

    const alertaAccesible = document.getElementById('alertaAccesible');
    if (alertaAccesible) {
        alertaAccesible.textContent = '';

        setTimeout(() => {
            alertaAccesible.textContent = mensaje;
        }, 100);
    }
}
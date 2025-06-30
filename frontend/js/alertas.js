// Exporta una función para mostrar una alerta visual y accesible en pantalla
export function mostrarAlerta(mensaje, tipo) {
    // Contenedor donde se mostrará la alerta visual (Bootstrap)
    const alertPlaceholder = document.getElementById('alertPlaceholder');

    // Inserta una alerta con clase dinámica según el tipo (success, danger, warning, etc.)
    alertPlaceholder.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;

    // Contenedor invisible para accesibilidad (lectores de pantalla)
    const alertaAccesible = document.getElementById('alertaAccesible');
    if (alertaAccesible) {
        // Limpia primero el contenido accesible
        alertaAccesible.textContent = '';

        // Espera un momento y luego escribe el mensaje (mejora la detección por lectores de pantalla)
        setTimeout(() => {
            alertaAccesible.textContent = mensaje;
        }, 100);
    }
}
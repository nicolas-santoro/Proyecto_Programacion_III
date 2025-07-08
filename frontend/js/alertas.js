/**
 * Esta función es super útil para mostrar mensajes al usuario
 * La uso en toda la app cuando necesito avisar algo (errores, éxitos, etc.)
 * Crea una alerta visual bonita y también una accesible para lectores de pantalla
 * @param {string} mensaje - el texto que quiero mostrar al usuario
 * @param {string} tipo - el tipo de alerta (success, danger, warning, info, etc.)
 */
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
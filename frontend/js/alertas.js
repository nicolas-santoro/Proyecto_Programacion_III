export function mostrarAlerta(mensaje, tipo) {
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
// Exporta la función que gestiona la cancelación de una compra
export function cancelarCompra() {
  // Elemento del botón que abre el modal de cancelación
  const btnCancelar = document.getElementById('cancelarCompra');

  // Botón dentro del modal para confirmar la cancelación
  const btnConfirmarCancelacion = document.getElementById('btnConfirmarCancelacion');

  // Instancia del modal de Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('modalCancelacion'));

  // Si existe el botón "Cancelar Compra", se le asigna evento para abrir el modal
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modal.show(); // Muestra el modal de confirmación
    });
  }

  // Si existe el botón de confirmación dentro del modal
  if (btnConfirmarCancelacion) {
    btnConfirmarCancelacion.addEventListener('click', () => {
      // Elimina el carrito del localStorage (mantiene el nombre del usuario)
      localStorage.removeItem('carrito');

      // Oculta el modal
      modal.hide();

      // Redirige a la página de inicio
      window.location.href = '/html/index.html';
    });
  }
}
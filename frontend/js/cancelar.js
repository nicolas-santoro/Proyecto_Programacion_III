// Esta función maneja todo lo que pasa cuando el usuario quiere cancelar su compra
// Configura los botones del modal y borra el carrito si confirma
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
  // Esta función se ejecuta cuando el usuario confirma que quiere cancelar TODO
  if (btnConfirmarCancelacion) {
    btnConfirmarCancelacion.addEventListener('click', () => {
      // Elimina el carrito del localStorage
      localStorage.removeItem('carrito');
      
      // Borrar el nombre del usuario al cancelar la compra
      localStorage.removeItem('nombreUsuario');

      // Oculta el modal
      modal.hide();

      // Redirige a la página de inicio
      window.location.href = '/html/index.html';
    });
  }
}
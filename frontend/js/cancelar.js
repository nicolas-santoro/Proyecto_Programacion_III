export function cancelarCompra() {
  const btnCancelar = document.getElementById('cancelarCompra'); // Botón que abre el modal
  const btnConfirmarCancelacion = document.getElementById('btnConfirmarCancelacion'); // Confirmar cancelación del modal
  const modal = new bootstrap.Modal(document.getElementById('modalCancelacion'));
  
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modal.show();
    });
  }

  if (btnConfirmarCancelacion) {
    btnConfirmarCancelacion.addEventListener('click', () => {
      // Limpiar solo el carrito, mantener el nombre del usuario
      localStorage.removeItem('carrito');
      modal.hide();
      // Redirigir al index
      window.location.href = '/html/index.html';
    });
  }
}


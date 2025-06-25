export function cancelarCompra() {
  const btnCancelar = document.getElementById('cancelarCompra'); // Botón que abre el modal
  const btnConfirmar = document.getElementById('btnConfirmarCompra'); // Confirmar del modal
  const modal = new bootstrap.Modal(document.getElementById('modalCancelacion'));
  
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modal.show();
    });
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/html/index.html'; // Redirigir donde corresponda
    });
  }
}


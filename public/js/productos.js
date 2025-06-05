fetch("http://localhost:3000/api/productos")
  .then(res => res.json())
  .then(productos => {
    // Filtrar solo productos activos
    const activos = productos.filter(p => p.activo);

    // Obtener los contenedores de cada categoría
    const librosDiv = document.getElementById("libros-container");
    const separadoresDiv = document.getElementById("separadores-container");

    // Limpiar contenedores
    if (librosDiv) librosDiv.innerHTML = '';
    if (separadoresDiv) separadoresDiv.innerHTML = '';

    // Renderizar productos según su categoría
    activos.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("producto", "card", "m-2", "p-2");
      div.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">Precio: $${prod.precio}</p>
        </div>
      `;

      if (prod.categoria === "libro" && librosDiv) {
        librosDiv.appendChild(div);
      } else if (prod.categoria === "separador" && separadoresDiv) {
        separadoresDiv.appendChild(div);
      }
    });
  })
  .catch(error => console.error('Error al cargar los productos:', error));
  /*El carrito aún no está porque todavía no trabajé en eso*/

/* Esto tengo que cambiarlo, lo hice mal
function agregarAlCarrito(id) {
    const producto = productosDisponibles.find(p => p.id === id);
    carrito.push(producto);
    actualizarCarrito();

    // Actualizar botones
    const card = encontrarCardPorId(id);
    card.querySelector('.btn-primary').classList.add('d-none');
    card.querySelector('.btn-danger').classList.remove('d-none');

    console.log('Carrito:', carrito);
}

function quitarDelCarrito(id) {
    const index = carrito.findIndex(p => p.id === id);
    if (index !== -1) carrito.splice(index, 1);
    actualizarCarrito();

    // Actualizar botones
    const card = encontrarCardPorId(id);
    card.querySelector('.btn-primary').classList.remove('d-none');
    card.querySelector('.btn-danger').classList.add('d-none');

    console.log('Carrito:', carrito);
}

function actualizarCarrito() {
    const lista = document.getElementById('carrito-lista');
    lista.innerHTML = '';
    carrito.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.titulo || p.tematica;
        lista.appendChild(li);
    });
}

function encontrarCardPorId(id) {
    return document.querySelector(`.card[data-id="${id}"]`);
}*/
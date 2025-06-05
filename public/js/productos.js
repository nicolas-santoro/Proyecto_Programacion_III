let productosDisponibles = []; // Aquí irás guardando los productos

fetch('../public/productos.json')
  .then(respuesta => respuesta.json())
  .then(data => {
    data.productos.forEach(producto => productosDisponibles.push(producto))

    renderProductos(productosDisponibles)
  })
  .catch(error => console.error('Error al cargar el JSON:', error));

const carrito = [];

function renderProductos(productosToRender) {
    const librosDiv = document.getElementById('libros-container');
    const separadoresDiv = document.getElementById('separadores-container');

    librosDiv.innerHTML = '';
    separadoresDiv.innerHTML = '';

    productosToRender.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('producto');
        card.classList.add('card');

        card.innerHTML = `
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.titulo || producto.tematica}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.titulo || producto.tematica}</h5>
                            <p class="card-text">
                            ${producto.tipo === 'libro' ? `
                                Autor: ${producto.autor}<br>
                                Año: ${producto.anioPublicacion}<br>
                                Páginas: ${producto.paginas}<br>
                                Calificación: ${producto.calificacion}
                            ` : `
                                Tamaño: ${producto.longitud} x ${producto.anchura} cm
                            `}
                            </p>
                            <button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
                            <button class="btn btn-danger d-none" onclick="quitarDelCarrito(${producto.id})">Quitar</button>
                        </div>
                        `;

        if (producto.tipo === 'libro') {
            librosDiv.appendChild(card);
        } 
        
        else {
            separadoresDiv.appendChild(card);
        }
    })

    const estaEnCarrito = carrito.some(p => p.id === producto.id);
    if (estaEnCarrito) {
        card.querySelector('.btn-primary').classList.add('d-none');
        card.querySelector('.btn-danger').classList.remove('d-none');
    }
};

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
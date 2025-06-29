const API_BASE = '/api';

let ventasData = [];

document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarVentas();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/html/admin-login.html';
        return;
    }
}

async function cargarVentas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/ventas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            ventasData = data.data || [];
            mostrarVentas(ventasData);
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/html/admin-login.html';
        } else {
            console.error('Error al cargar ventas');
            mostrarAlerta('Error al cargar las ventas', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

function mostrarVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="icon">💵</div>
                        <h3>No hay ventas registradas</h3>
                        <p>Las ventas aparecerán aquí cuando los clientes realicen compras</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';
    ventas.forEach(venta => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venta._id.slice(-6).toUpperCase()}</td>
            <td>${new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
            <td>${venta.nombreCliente}</td>
            <td>${venta.productos.length} producto(s)</td>
            <td>$${venta.total.toFixed(2)}</td>
            <td>
                <button class="btn" onclick="verDetalle('${venta._id}')">
                    Ver detalles
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Eliminamos la función actualizarResumen completa

function mostrarAlerta(mensaje, tipo) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

async function verDetalle(ventaId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/ventas/${ventaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const venta = data.data;
            mostrarDetalleVenta(venta);
        } else {
            mostrarAlerta('Error al cargar el detalle de la venta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

function mostrarDetalleVenta(venta) {
    const content = document.getElementById('detalleVentaContent');
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="color: #6a0dad; margin-bottom: 15px;">Información General</h4>
            <p><strong>ID:</strong> #${venta._id.slice(-6).toUpperCase()}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-ES')}</p>
            <p><strong>Cliente:</strong> ${venta.nombreCliente}</p>
            <p><strong>Total:</strong> $${venta.total.toFixed(2)}</p>
        </div>
        
        <div>
            <h4 style="color: #6a0dad; margin-bottom: 15px;">Productos</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Producto</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Cantidad</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Precio</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${venta.productos.map(prod => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${prod.nombre}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${prod.cantidad}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${prod.precio.toFixed(2)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${(prod.cantidad * prod.precio).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('detalleVentaModal').style.display = 'block';
}


// Cerrar modal
document.getElementById('closeModal').onclick = function() {
    document.getElementById('detalleVentaModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('detalleVentaModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
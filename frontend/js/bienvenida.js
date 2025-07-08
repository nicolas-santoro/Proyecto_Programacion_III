/**
 * MÓDULO DE BIENVENIDA - Acá el usuario pone su nombre para entrar
 * 
 * Este archivo maneja toda la página de entrada donde la gente
 * tiene que poner su nombre para poder entrar a ver los productos.
 * 
 * ¿Qué hace?
 * - Valida que el nombre esté bien (solo letras, nada raro)
 * - Lo convierte a mayúsculas
 * - Lo guarda en el navegador para acordarse después
 * - Te manda a la página de productos si todo salió bien
 * 
 * @fileoverview Gestión de entrada de usuarios en la página de bienvenida
 * @author Hachis Parmentier
 * @version 1.0.0
 */

// Importa la función para mostrar alertas (visual y accesible)
import { mostrarAlerta } from './alertas.js';

/**
 * Event Listener Principal - Manejo del Formulario de Bienvenida
 * 
 * Esta función se dispara cuando alguien hace clic en el botón de enviar.
 * Básicamente hace todo el proceso de validar el nombre y mandarte
 * a la página de productos si está todo bien.
 * 
 * ¿Cómo funciona paso a paso?
 * 1. Agarra lo que escribiste y le saca los espacios
 * 2. Se fija que no esté vacío
 * 3. Chequea que solo tenga letras, nada de números o símbolos raros
 * 4. Lo pone en mayúsculas porque queda más prolijo
 * 5. Lo guarda en el localStorage para después
 * 6. Mandarte directo a productos.html
 * 
 * @function manejarEnvioFormulario
 * @param {Event} event - El evento del click en el botón
 * @returns {void} - No devuelve nada, pero te puede mandar a otra página
 * 
 * @example
 * // Si escribís "juan" → se convierte en "JUAN" y te manda a productos
 * // Si escribís "juan123" → te tira error porque tiene números
 */
// Agrega un listener al botón con ID 'btnEnviar'
document.getElementById('btnEnviar').addEventListener('click', function() {
    /**
     * Paso 1: Agarrar y limpiar lo que escribió el usuario
     * 
     * Primero buscamos el input donde está el nombre y agarramos
     * lo que escribió. Le aplicamos trim() para sacarle los espacios
     * al principio y al final que siempre quedan por error.
     */
    // Obtiene el valor del input de nombre
    const nombreInput = document.getElementById('nombreUsuario');
    let nombre = nombreInput.value.trim(); // Elimina espacios antes/después

    /**
     * Validación 1: Campo vacío
     * 
     * Acá chequeamos si el campo está vacío. Si no escribió nada,
     * le mostramos un mensaje de error y cortamos todo ahí.
     * No tiene sentido seguir si no puso ni el nombre.
     * 
     * @param {string} nombre - El nombre que escribió (ya sin espacios)
     * @returns {void} - Si está vacío, corta la función con return
     */
    // Validación: el campo no puede estar vacío
    if (nombre === '') {
        mostrarAlerta('El nombre no puede estar vacío.', 'danger');
        return; // Acá cortamos todo si no escribió nada
    }

    /**
     * Validación 2: ¿Solo tiene letras o metió cualquier cosa?
     * 
     * Acá usamos una regex (expresión regular) para validar que
     * el nombre tenga solo letras. Nada de números, símbolos raros,
     * espacios en el medio, nada. Solo letras.
     * 
     * La regex explicada para mortales:
     * - ^: Arranca desde el principio
     * - [A-Za-z]: Letras normales (mayúsculas y minúsculas)
     * - ÁÉÍÓÚáéíóú: Letras con tildes (porque somos argentinos)
     * - Ññ: La ñ
     * - +: Que tenga una o más letras
     * - $: Que termine ahí, nada más
     * 
     * @param {string} nombre - El nombre a validar
     * @returns {void} - Si no pasa la validación, corta la función
     */
    // Validación: el nombre debe contener solo letras sin espacios ni símbolos
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;
    if (!regex.test(nombre)) {
        mostrarAlerta('El nombre solo puede contener letras (sin espacios ni caracteres especiales).', 'danger');
        return; // Si tiene números o símbolos, chau
    }

    /**
     * Paso 3: Convertir a mayúsculas porque queda más lindo
     * 
     * Acá agarramos el nombre que ya validamos y lo convertimos
     * todo a mayúsculas. ¿Por qué? Porque queda más prolijo
     * y uniforme en toda la aplicación.
     */
    // Convierte el nombre a mayúsculas
    nombre = nombre.toUpperCase();

    /**
     * Paso 4: Guardar en el navegador para después
     * 
     * Usamos localStorage para guardar el nombre en el navegador.
     * Así cuando el usuario vaya a otras páginas, nos acordamos
     * de quién es sin que tenga que escribir el nombre de vuelta.
     * 
     * @param {string} key - La clave 'nombreUsuario' para identificar el dato
     * @param {string} value - El nombre en mayúsculas que guardamos
     */
    // Guarda el nombre en localStorage para uso posterior
    localStorage.setItem('nombreUsuario', nombre);

    /**
     * Paso 5: Mandarlo a la página de productos
     * 
     * Si llegamos hasta acá, significa que todo salió bien.
     * El nombre está validado, guardado, y ahora podemos mandar
     * al usuario a la página donde están todos los productos.
     */
    // Redirige a la página de productos
    window.location.href = './productos.html';
});
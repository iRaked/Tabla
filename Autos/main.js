const MAX_CARTAS_POR_JUGADOR = 2;
const dbCartas = Array.from({ length: 54 }, (_, i) => `${i + 1}.png`);
let usuarioActivo = null;
let usuarios = {};
//  LOGIN
function iniciarSesion() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");

  usuarioActivo = nombre;

  const datosGuardados = localStorage.getItem("usuariosCartas");
  if (datosGuardados) {
    usuarios = JSON.parse(datosGuardados);
  }
    
    if (usuarios[usuarioActivo]) {
  mostrarMensajeBienvenida(usuarioActivo); // 👈 Mensaje para usuarios recurrentes
} else {
  usuarios[usuarioActivo] = []; // 👈 Registro nuevo
}

  if (!usuarios[usuarioActivo]) {
    usuarios[usuarioActivo] = [];
  }

  document.getElementById("usuarioActivoDisplay").textContent = `Bienvenid@, ${usuarioActivo}`;
  activarCelebracion();
  guardarEstado();
  renderCartasDisponibles();
  renderCartasSeleccionadas();
  renderTablaUsuarios();
  mostrarProgresoUsuarios(); // ✅ Aquí se actualiza el progreso
  verificarInicioTemporizador(); // ✅ Aquí se evalúa si debe iniciar
}

const usuariosFiltrados = Object.entries(usuarios)
  .filter(([nombre]) => nombre && nombre !== "null")
  .sort();

//  SALUDO DE BUENA SUERTE
function mostrarMensajeBienvenida(nombre) {
  const mensaje = document.createElement("div");
  mensaje.textContent = `Bienvenid@ de nuevo ${nombre}, que la suerte te acompañe 🍀`;
  mensaje.className = "mensaje-bienvenida";
  document.body.appendChild(mensaje);
  setTimeout(() => mensaje.remove(), 4000);
}

//  RENDER DE CARTAS DISPONIBLES
function renderCartasDisponibles() {
  const panel = document.getElementById("panelCartasDisponibles");
  panel.innerHTML = "";

  const cartasOcupadas = obtenerCartasOcupadas();

  dbCartas.forEach(nombreArchivo => {
    const img = document.createElement("img");
    img.src = `assets/cartas/${nombreArchivo}`;
    img.alt = nombreArchivo;

    const dueño = cartasOcupadas[nombreArchivo];

    if (dueño) {
      img.classList.add("ocupada");
      img.title = `Ocupada por ${dueño}`;
    } else if (usuarios[usuarioActivo].length < MAX_CARTAS_POR_JUGADOR) {
  img.onclick = () => seleccionarCarta(nombreArchivo);
}

    panel.appendChild(img);
  });
}
//  COPIAR CARTAS
function copiarCarta() {
  if (!usuarioActivo || !usuarios[usuarioActivo] || usuarios[usuarioActivo].length === 0) {
    alert("No hay cartas seleccionadas para copiar.");
    return;
  }

  const cartas = usuarios[usuarioActivo];
  const texto = `Cartas de ${usuarioActivo}: ${cartas.join(", ")}`;

  // Crear un elemento temporal para copiar
  const tempInput = document.createElement("textarea");
  tempInput.value = texto;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  alert("Cartas copiadas al portapapeles.");
}
//  SELECCIÓN DE CARTAS
function seleccionarCarta(nombreArchivo) {
  const cartas = usuarios[usuarioActivo];
  const cartasOcupadas = obtenerCartasOcupadas();

  if (cartas.length >= MAX_CARTAS_POR_JUGADOR) {
  alert(`Ya has seleccionado ${MAX_CARTAS_POR_JUGADOR} cartas.`);
  return;
}

  if (cartasOcupadas[nombreArchivo]) {
    alert(`Esta carta ya fue tomada por ${cartasOcupadas[nombreArchivo]}`);
    return;
  }

  cartas.push(nombreArchivo);
  guardarEstado();
  renderCartasSeleccionadas();
  renderCartasDisponibles();
  renderTablaUsuarios();
}
//  RENDER DE TABLA DE USUARIOS
function renderTablaUsuarios() {
  const tabla = document.getElementById("tablaUsuarios");
  tabla.innerHTML = "";

  const usuariosOrdenados = Object.entries(usuarios)
    .filter(([nombre]) => nombre && nombre !== "null")
    .sort();

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  trHead.innerHTML = "<th>Usuario</th>" + 
  Array.from({ length: MAX_CARTAS_POR_JUGADOR }, (_, i) => `<th>Carta ${i + 1}</th>`).join("");
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  usuariosOrdenados.forEach(([nombre, cartas]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${nombre}</td>` + 
  Array.from({ length: MAX_CARTAS_POR_JUGADOR }, (_, i) => `<td>${cartas[i] || ""}</td>`).join("");
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tabla.appendChild(table);
}
//  OBTENER CARTAS OCUPADAS
function obtenerCartasOcupadas() {
  const ocupadas = {};
  for (const [usuario, cartas] of Object.entries(usuarios)) {
    cartas.forEach(carta => {
      ocupadas[carta] = usuario;
    });
  }
  return ocupadas;
}
//  GUARDAR ESTADO
function guardarEstado() {
  localStorage.setItem("usuariosCartas", JSON.stringify(usuarios));
}
//  RENDER DE CARTAS SELECCIONADAS
function renderCartasSeleccionadas() {
  const contenedor = document.getElementById("cartasSeleccionadas");
  contenedor.innerHTML = "";

  const cartas = usuarios[usuarioActivo] || [];

  // Mostrar u ocultar el botón según la cantidad de cartas
  const btnCopiar = document.getElementById("btnCopiarCarta");
  if (btnCopiar) {
    btnCopiar.style.display = cartas.length > 0 ? "inline-block" : "none";
  }

  cartas.forEach((nombreArchivo, index) => {
    const div = document.createElement("div");
    div.className = "carta-seleccionada";
    if (index === 0) div.classList.add("carta-principal");

    const img = document.createElement("img");
    img.src = `assets/cartas/${nombreArchivo}`;
    img.alt = nombreArchivo;
    img.style.width = "100px";

    div.appendChild(img);
    contenedor.appendChild(div);
  });
}
//  CELEBRACION
function activarCelebracion() {
  const canvas = document.getElementById("celebracionCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particulas = [];

  for (let i = 0; i < 80; i++) {
    particulas.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 4 + 2,
      alpha: 1
    });
  }
//  ANIMAR?
  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach(p => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.alpha -= 0.02;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
      ctx.fill();
    });

    if (particulas.some(p => p.alpha > 0)) {
      requestAnimationFrame(animar);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animar();
}

// PARTE 2 **********************************************************************

// 🎨 CONVERSIÓN DE COLOR HSL → RGB
function hexToRgb(hslColor) {
  const temp = document.createElement("div");
  temp.style.color = hslColor;
  document.body.appendChild(temp);
  const rgb = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return rgb.match(/\d+/g).join(",");
}

// ⏱️ CONFIGURACIÓN DEL TEMPORIZADOR
const DURACION_MINUTOS = 1; // Cambia a 30 cuando esté listo
const DURACION_MS = DURACION_MINUTOS * 60 * 1000;
const contenedorTemporizador = document.getElementById("temporizadorReactivacion");
let temporizadorActivo = false;
let intervaloTemporizador = null;

// ✅ VERIFICAR SI TODOS HAN ELEGIDO
function todosHanElegidoCartas() {
  const usuariosValidos = Object.entries(usuarios).filter(([nombre]) => nombre && nombre !== "null");
  if (usuariosValidos.length === 0) return false;

  return usuariosValidos.every(([_, cartas]) => cartas.length === 3); // #CARTAS
}

// 🚦 VERIFICAR INICIO AUTOMÁTICO
function verificarInicioTemporizador() {
  if (todosHanElegidoCartas() && !temporizadorActivo) {
    iniciarTemporizadorGlobal();
    temporizadorActivo = true;
    console.log("⏱ Temporizador iniciado automáticamente");
  }
}

// 🕒 INICIO DEL TEMPORIZADOR
function iniciarTemporizadorGlobal() {
  let tiempoRestante = DURACION_MS;

  intervaloTemporizador = setInterval(() => {
    tiempoRestante -= 1000;

    const minutos = Math.floor(tiempoRestante / 60000);
    const segundos = Math.floor((tiempoRestante % 60000) / 1000);

    contenedorTemporizador.innerHTML = `<span>${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}</span>`;

    if (tiempoRestante <= 10000) {
      contenedorTemporizador.classList.add("glow");
    }

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      contenedorTemporizador.classList.remove("glow");
      contenedorTemporizador.innerHTML = `<span>¡Cartas actualizadas!</span>`;
      cambiarCartasGlobalmente();
      temporizadorActivo = false;
      setTimeout(verificarInicioTemporizador, 1000);
    }
  }, 1000);
}

function iniciarTemporizador(duracionSegundos) {
  let tiempoRestante = duracionSegundos;

  intervaloTemporizador = setInterval(() => {
    tiempoRestante--;
    actualizarTemporizador(tiempoRestante);

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      reiniciarRonda(); // 💥 Aquí se limpia todo
    }
  }, 1000);
}

// 🧹 LIBERAR CARTAS DE TODOS LOS USUARIOS
function cambiarCartasGlobalmente() {
  console.log("🧹 Reiniciando selección de cartas...");

  usuarios = {}; // 🔥 Borra todos los usuarios
  localStorage.removeItem("usuariosCartas"); // 🔥 Limpia el almacenamiento

  renderCartasDisponibles();
  renderCartasSeleccionadas();
  document.getElementById("tablaUsuarios").innerHTML = ""; // 🔄 Limpieza explícita
  renderTablaUsuarios();
  mostrarProgresoUsuarios();
  mostrarMensajeCartasActualizadas();
}

// CONTADOR DE USUARIOS

function mostrarProgresoUsuarios() {
  const contenedorProgreso = document.getElementById("progresoUsuarios");
  contenedorProgreso.innerHTML = "";
    
    const contenedor = document.getElementById("progresoUsuarios");
contenedor.classList.add("actualizado");
setTimeout(() => contenedor.classList.remove("actualizado"), 300);

  const usuariosValidos = Object.entries(usuarios)
    .filter(([nombre]) => nombre && nombre !== "null" && nombre.trim() !== "");

  const totalUsuarios = usuariosValidos.length;
  let completos = 0;

  usuariosValidos.forEach(([_, cartas]) => {
    if (Array.isArray(cartas) && cartas.length === 3 && cartas.every(c => c)) {
      completos++;
    }
  });

  const faltantes = totalUsuarios - completos;

  contenedorProgreso.innerHTML = `
    <p><strong>Usuarios listos:</strong> ${completos} / ${totalUsuarios}</p>
    <p><strong>Faltan:</strong> ${faltantes} usuario${faltantes !== 1 ? "s" : ""} por completar sus cartas</p>
  `;
}

// ✨ MENSAJE VISUAL
function mostrarMensajeCartasActualizadas() {
  const mensaje = document.createElement("div");
  mensaje.textContent = "¡CARTAS ACTUALIZADAS!";
  mensaje.className = "mensaje-actualizado";
  document.body.appendChild(mensaje);
  setTimeout(() => mensaje.remove(), 3000);
}

// 🃏 GENERAR CARTAS ALEATORIAS (si decides usarlo)
function generarCartasAleatorias() {
  const cartasDisponibles = [...dbCartas];
  const nuevasCartas = [];
  const ocupadas = obtenerCartasOcupadas();

  while (nuevasCartas.length < 3 && cartasDisponibles.length > 0) {
    const index = Math.floor(Math.random() * cartasDisponibles.length);
    const carta = cartasDisponibles.splice(index, 1)[0];

    if (!ocupadas[carta] && !nuevasCartas.includes(carta)) {
      nuevasCartas.push(carta);
    }
  }

  return nuevasCartas;
}

//  REINICIAR RONDA DESDE CERO
function reiniciarRonda() {
  usuarios = {}; // 🔥 Borra todos los usuarios
  localStorage.removeItem("usuariosCartas"); // ✅ Usa la clave correcta

  renderTablaUsuarios();
  renderCartasDisponibles();
  renderCartasSeleccionadas();
  mostrarProgresoUsuarios();
  mostrarMensajeGlobal("🌀 Nueva ronda iniciada. Regístrate para jugar.");
}
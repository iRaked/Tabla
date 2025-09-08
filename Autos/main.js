//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗂️ Base de cartas
const dbCartas = Array.from({ length: 54 }, (_, i) => `${i + 1}.png`);
let usuarioActivo = null;
let usuarios = {};

// 🧑‍💻 LOGIN
function iniciarSesion() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");

  // 🧠 Restaurar estado previo si existe
  const cartasGuardadas = JSON.parse(localStorage.getItem("usuariosCartas"));
  if (cartasGuardadas) {
    usuarios = cartasGuardadas;
  }

  // 🎯 Asignar usuario activo
  usuarioActivo = nombre;

  // 🃏 Inicializar usuario si no existe
  if (!usuarios[usuarioActivo]) {
    usuarios[usuarioActivo] = [];
  }

  // 🖼️ Actualizar interfaz
  document.getElementById("usuarioActivoDisplay").textContent = `Bienvenid@, ${usuarioActivo}`;
  activarCelebracion();

  // 💾 Guardar estado completo
  guardarEstado();
  console.log("🔐 Estado guardado tras iniciar sesión");

  // 🧩 Renderizar componentes
  renderCartasDisponibles();
  renderCartasSeleccionadas();
  renderTablaUsuarios();
  mostrarProgresoUsuarios();
  verificarInicioTemporizador();
}

// 🧹 Filtrado limpio de usuarios activos
const usuariosFiltrados = Object.entries(usuarios)
  .filter(([nombre]) => nombre && nombre !== "null" && nombre.trim() !== "")
  .sort();

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
    } else if (usuarios[usuarioActivo].length < 3) {
      img.onclick = () => seleccionarCarta(nombreArchivo);
    }

    panel.appendChild(img);
  });
}
//  COPIAR CARTAS
const mapaCartas = {
  1: "Acura",
  2: "Alfa Romeo",
  3: "Aston Martin",
  4: "Audi",
  5: "Bentley",
  6: "BMW",
  7: "Bugatti",
  8: "Buick",
  9: "Cadillac",
  10: "Chevrolet",
  11: "Chrysler",
  12: "Citroën",
  13: "Cupra",
  14: "Dodge",
  15: "Ferrari",
  16: "Fiat",
  17: "Ford",
  18: "GMC",
  19: "Honda",
  20: "Hummer",
  21: "Hyundai",
  22: "Infiniti",
  23: "Isuzu",
  24: "Jaguar",
  25: "Jeep",
  26: "Kia",
  27: "Lamborghini",
  28: "Land Rover",
  29: "Lexus",
  30: "Lincoln",
  31: "Lotus",
  32: "Maserati",
  33: "Mazda",
  34: "Mercedes Benz",
  35: "Mercury",
  36: "Mini",
  37: "Mitsubishi",
  38: "Nissan",
  39: "Opel",
  40: "Pagani",
  41: "Peugeot",
  42: "Pontiac",
  43: "Porsche",
  44: "RAM",
  45: "Renault",
  46: "Rolls Royce",
  47: "Seat",
  48: "Shelby",
  49: "Smart",
  50: "Subaru",
  51: "Suzuki",
  52: "Tesla",
  53: "Toyota",
  54: "Volkswagen"
};

function copiarCarta() {
  if (!usuarioActivo || !usuarios[usuarioActivo] || usuarios[usuarioActivo].length === 0) {
    alert("No hay cartas seleccionadas para copiar.");
    return;
  }

  const cartas = usuarios[usuarioActivo];

  // Convertir números a nombres reales
  const nombresCartas = cartas.map(num => mapaCartas[parseInt(num)] || `Carta ${num}`);
  const texto = nombresCartas.join(", ");

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
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function seleccionarCarta(nombreArchivo) {
  const cartas = usuarios[usuarioActivo];
  const cartasOcupadas = obtenerCartasOcupadas();
    // NUMERO DE CARTAS POR USUARIO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (cartas.length >= 3) {
    alert("Ya has seleccionado 3 cartas.");
    return;
  }

  if (cartasOcupadas[nombreArchivo]) {
    alert(`Esta carta ya fue tomada por ${cartasOcupadas[nombreArchivo]}`);
    return;
  }

  cartas.push(nombreArchivo);
  guardarEstado();
  localStorage.setItem("inicioRitual", Date.now());
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
  trHead.innerHTML = "<th>Usuario</th><th>Carta 1</th><th>Carta 2</th><th>Carta 3</th>";
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  usuariosOrdenados.forEach(([nombre, cartas]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${cartas[0] || ""}</td>
      <td>${cartas[1] || ""}</td>
      <td>${cartas[2] || ""}</td>
    `;
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
    console.log("💾 Estado guardado en localStorage:", JSON.stringify(usuarios));
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

// 🎨 CONVERSIÓN DE COLOR HSL → RGB
function hexToRgb(hslColor) {
  const temp = document.createElement("div");
  temp.style.color = hslColor;
  document.body.appendChild(temp);
  const rgb = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return rgb.match(/\d+/g).join(",");
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏱️ CONFIGURACIÓN DEL TEMPORIZADOR
const DURACION_MINUTOS = 3; // Cambia a 30 cuando esté listo
const DURACION_MS = DURACION_MINUTOS * 60 * 1000;
const contenedorTemporizador = document.getElementById("temporizadorReactivacion");
let temporizadorActivo = false;
let intervaloTemporizador = null;

// ✅ VERIFICAR SI TODOS HAN ELEGIDO
function todosHanElegidoCartas() {
  const usuariosValidos = Object.entries(usuarios).filter(([nombre]) => nombre && nombre !== "null");
  if (usuariosValidos.length === 0) return false;

  return usuariosValidos.every(([_, cartas]) => cartas.length === 3);
}

// 🚦 VERIFICAR INICIO AUTOMÁTICO
function verificarInicioTemporizador() {
  const inicioRitual = parseInt(localStorage.getItem("inicioRitual"), 10);
  const ahora = Date.now();

  // ⛔ Si el ritual ya expiró, no iniciar temporizador
  if (inicioRitual && (ahora - inicioRitual >= DURACION_MS)) {
    console.log("⏳ El ritual ha expirado. No se inicia el temporizador.");
    return;
  }

  // ✅ Si todos han elegido y el temporizador no está activo, iniciarlo
  if (todosHanElegidoCartas() && !temporizadorActivo) {
    const yaIniciado = localStorage.getItem("inicioRitual");
    if (!yaIniciado) {
      localStorage.setItem("inicioRitual", Date.now().toString());
    }

    // 🧪 Verificación DOM antes de iniciar
    if (contenedorTemporizador) {
      console.log("🧭 Contenedor del temporizador encontrado.");
      iniciarTemporizadorGlobal();
      temporizadorActivo = true;
      console.log("⏱ Temporizador iniciado automáticamente");
    } else {
      console.warn("⚠️ No se encontró el contenedor del temporizador. Verifica el ID.");
    }
  }
}

// 🕒 INICIO DEL TEMPORIZADOR
function iniciarTemporizadorGlobal() {
  const inicioRitual = parseInt(localStorage.getItem("inicioRitual"), 10);
  const ahora = Date.now();

  let tiempoRestante = DURACION_MS;

  // 🧠 Si el ritual ya fue iniciado, ajustar el tiempo restante
  if (inicioRitual && (ahora - inicioRitual < DURACION_MS)) {
    tiempoRestante = DURACION_MS - (ahora - inicioRitual);
  } else {
    // 📝 Si no hay inicio registrado, lo guardamos ahora
    localStorage.setItem("inicioRitual", ahora.toString());
  }

  intervaloTemporizador = setInterval(() => {
    tiempoRestante -= 1000;

    const minutos = Math.floor(tiempoRestante / 60000);
    const segundos = Math.floor((tiempoRestante % 60000) / 1000);

    // 🎯 Mostrar tiempo restante en el contenedor
    contenedorTemporizador.innerHTML = `<span>${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}</span>`;

    // ✨ Activar glow emocional en los últimos 10 segundos
    if (tiempoRestante <= 10000) {
      contenedorTemporizador.classList.add("glow");
    }

    // 🧹 Cuando el tiempo se agota, limpiar y actualizar cartas
    if (tiempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      contenedorTemporizador.classList.remove("glow");
      contenedorTemporizador.innerHTML = `<span>¡Cartas actualizadas!</span>`;
      cambiarCartasGlobalmente();
      temporizadorActivo = false;

      // 🔄 Reiniciar verificación por si nuevos usuarios se unen
      setTimeout(verificarInicioTemporizador, 1000);
    }
  }, 1000);
}

// 🧹 LIBERAR CARTAS DE TODOS LOS USUARIOS
function cambiarCartasGlobalmente() {
  console.log("🧹 Reiniciando selección de cartas...");

  for (const nombre in usuarios) {
    if (nombre && nombre !== "null") {
      usuarios[nombre] = [];
    }
  }

  guardarEstado();
  renderCartasDisponibles();
  renderCartasSeleccionadas();
  renderTablaUsuarios();
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

// 🆕 BLOQUE NUEVO: Reiniciar juego manualmente
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function reiniciarJuegoManual() {
  clearInterval(intervaloTemporizador);
  temporizadorActivo = false;
  usuarios = {};
  usuarioActivo = null;
  localStorage.removeItem("usuariosCartas");
    setTimeout(verificarInicioTemporizador, 1000);
    setTimeout(() => {
  document.getElementById("temporizadorReactivacion").innerHTML = "";
}, 5000);

  document.getElementById("usuarioActivoDisplay").textContent = "";
  document.getElementById("cartasSeleccionadas").innerHTML = "";
  document.getElementById("panelCartasDisponibles").innerHTML = "";
  document.getElementById("tablaUsuarios").innerHTML = "";
  document.getElementById("progresoUsuarios").innerHTML = "";
  document.getElementById("temporizadorReactivacion").innerHTML = "Juego reiniciado 🎉";
  document.getElementById("nombreUsuario").value = "";
}

// 🧱 Lista de administradores
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const administradores = ["RICK", "Roger", "Lunita", "Lunna"]; // Añade más si lo deseas

// 🔍 Verificar si el usuario es administrador
function esAdministrador(nombre) {
  return administradores.includes(nombre);
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 Reinicio manual con contraseña secreta
function reiniciarJuegoConClave() {
  if (!esAdministrador(usuarioActivo)) {
    alert("Solo los administradores pueden reiniciar el juego.");
    return;
  }

  // PASWORD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const claveConfirmacion = "Raked"; // Puedes cambiarla por otra palabra clave
  const entrada = prompt(`Escribe la palabra secreta para confirmar el reinicio:`);

  if (entrada !== claveConfirmacion) {
    alert("Reinicio cancelado. La palabra no coincide.");
    return;
  }

  // ✅ Reinicio confirmado
  clearInterval(intervaloTemporizador);
  temporizadorActivo = false;
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ Temporizador ritual
setTimeout(() => {
  // 🧹 Limpieza reforzada
  localStorage.removeItem("usuariosCartas");
  localStorage.setItem("usuariosCartas", JSON.stringify({}));
  usuarios = {};
  usuarioActivo = null;

  // 🧼 Limpieza visual
  document.getElementById("usuarioActivoDisplay").textContent = "";
  document.getElementById("cartasSeleccionadas").innerHTML = "";
  document.getElementById("panelCartasDisponibles").innerHTML = "";

  alert("El ritual ha concluido. Las cartas han sido liberadas.");
}, DURACION_RITUAL); // Reemplaza con tu duración real

// 🌅 Restauración al cargar
//*********************************************************************************
window.addEventListener("load", () => {
  const DURACION_RITUAL = 1000 * 60 * 3; // 3 minutos
  const inicioRitual = parseInt(localStorage.getItem("inicioRitual"), 10);
  const ahora = Date.now();

  const cartasGuardadas = JSON.parse(localStorage.getItem("usuariosCartas"));

  if (cartasGuardadas && Object.keys(cartasGuardadas).length > 0) {
    // 🧠 Restaurar estado
    usuarios = cartasGuardadas;
    usuarioActivo = Object.keys(usuarios)[0]; // ← puedes ajustar esta lógica si usas múltiples sesiones

    // 🖼️ Renderizar interfaz
    document.getElementById("usuarioActivoDisplay").textContent = `Bienvenido, ${usuarioActivo}`;
    renderCartasSeleccionadas();
    renderCartasDisponibles();
    renderTablaUsuarios();
    mostrarProgresoUsuarios();

    // ⏳ Verificar si el ritual sigue activo
    if (inicioRitual && (ahora - inicioRitual < DURACION_RITUAL)) {
      const tiempoRestante = DURACION_RITUAL - (ahora - inicioRitual);

      // 🕒 Reprogramar limpieza solo si aún hay tiempo
      setTimeout(() => {
        console.log("🧹 Ritual expirado. Se procede a limpiar.");
        localStorage.removeItem("usuariosCartas");
        localStorage.removeItem("inicioRitual");
        usuarios = {};
        usuarioActivo = null;

        document.getElementById("usuarioActivoDisplay").textContent = "";
        document.getElementById("cartasSeleccionadas").innerHTML = "";
        document.getElementById("panelCartasDisponibles").innerHTML = "";

        alert("El ritual ha concluido. Las cartas han sido liberadas.");
      }, tiempoRestante);
    } else {
      // 🧹 Si el tiempo ya expiró, limpiar de inmediato
      console.log("🧹 Ritual ya expirado. Limpieza inmediata.");
      localStorage.removeItem("usuariosCartas");
      localStorage.removeItem("inicioRitual");
      usuarios = {};
      usuarioActivo = null;

      document.getElementById("usuarioActivoDisplay").textContent = "";
      document.getElementById("cartasSeleccionadas").innerHTML = "";
      document.getElementById("panelCartasDisponibles").innerHTML = "";

      alert("El ritual ha concluido. Las cartas han sido liberadas.");
    }
  } else {
    console.log("📭 No hay cartas guardadas. Estado limpio.");
  }
});

  // 🧼 Verificación de cartas disponibles
  if (!cartasDisponibles || cartasDisponibles.length === 0) {
    document.getElementById("panelCartasDisponibles").textContent = "🎴 Sin cartas disponibles";
  }

  document.getElementById("tablaUsuarios").innerHTML = "";
  document.getElementById("progresoUsuarios").innerHTML = "";
  document.getElementById("temporizadorReactivacion").innerHTML = "Juego reiniciado 🎉";
  document.getElementById("nombreUsuario").value = "";

  // 🔁 Forzar render vacío
  renderTablaUsuarios();

  // 🧪 Verificación opcional en consola
  console.log("Usuarios después del reinicio:", usuarios);

  setTimeout(verificarInicioTemporizador, 1000);
}


// Mostrar botón Reset solo si es administrador
window.addEventListener("DOMContentLoaded", () => {
  const botonReset = document.querySelector(".btn-reset");

  if (!botonReset) return; // 🛡 Protección contra null

  if (usuarioActivo && esAdministrador(usuarioActivo)) {
    botonReset.style.display = "inline-block";
  } else {
    botonReset.style.display = "none";
  }
});

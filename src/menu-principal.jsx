/**
 * @file AgroSoft.jsx
 * @description Dashboard principal del sistema de gestión agrícola AgroSoft.
 *              Muestra alertas, clima local, resumen de cultivos, sistema de
 *              riego y lista de tareas pendientes en una sola vista.
 * @version 2.4.1
 * @author Equipo AgroSoft
 */

import { useState } from "react";

// ===========================================================================
// SECCIÓN 1 – CONSTANTES Y DATOS ESTÁTICOS
// ---------------------------------------------------------------------------
// Se definen fuera de los componentes para evitar recrearlos en cada render.
// En producción estos valores llegarían desde una API REST o GraphQL pero por el momento solo es un borrador.
// ===========================================================================

/**
 * @constant {string} APP_VERSION
 * Versión actual de la aplicación mostrada en el pie de página.
 */
const APP_VERSION = "v2.4.1";

/**
 * @constant {string} APP_YEAR
 * Año de copyright mostrado en el pie de página.
 */
const APP_YEAR = "2026";

/**
 * @typedef  {Object} AlertaItem
 * @property {number} id    - Identificador único de la alerta.
 * @property {string} texto - Mensaje descriptivo de la alerta.
 */

/**
 * @constant {AlertaItem[]} ALERTAS
 * Lista de alertas críticas del sistema agrícola.
 */
const ALERTAS = [
  { id: 1, texto: "Riesgo de helada esta noche — Sector Norte" },
  { id: 2, texto: "Nivel bajo de fertilizante en depósito B" },
  { id: 3, texto: "Sensor de humedad 4 sin señal hace 2 h" },
];

/**
 * @typedef  {Object} MetricaCultivo
 * @property {string} label - Nombre descriptivo de la métrica.
 * @property {string} valor - Valor numérico o textual a mostrar.
 */

/**
 * @constant {MetricaCultivo[]} METRICAS_CULTIVOS
 * Estadísticas generales del estado actual de los cultivos.
 */
const METRICAS_CULTIVOS = [
  { label: "Parcelas activas",  valor: "12"     },
  { label: "Salud promedio",    valor: "87%"    },
  { label: "Cosechas próximas", valor: "3"      },
  { label: "Área total",        valor: "4.2 ha" },
  { label: "Rendimiento",       valor: "92%"    },
  { label: "Plagas detectadas", valor: "2"      },
];

/**
 * @constant {string[]} ZONAS_RIEGO
 * Nombres de las zonas de riego disponibles en el sistema.
 */
const ZONAS_RIEGO = ["Zona A", "Zona B", "Zona C", "Zona D", "Zona E"];

/**
 * @typedef  {Object} Tarea
 * @property {number}  id       - Identificador único de la tarea.
 * @property {string}  texto    - Descripción de la tarea.
 * @property {string}  etiqueta - Prioridad: "Urgente" | "Hoy" | "Semana".
 * @property {string}  color    - Color HEX de la etiqueta de prioridad.
 * @property {boolean} hecho    - Indica si la tarea fue completada.
 */

/**
 * @constant {Tarea[]} TAREAS_INICIALES
 * Lista de tareas pendientes al cargar la aplicación.
 */
const TAREAS_INICIALES = [
  { id: 1, texto: "Aplicar fungicida lote 3",        etiqueta: "Urgente", color: "#e05c2a", hecho: false },
  { id: 2, texto: "Revisar boquillas de riego",       etiqueta: "Hoy",     color: "#4caf50", hecho: true  },
  { id: 3, texto: "Fertilizar parcela A2",            etiqueta: "Semana",  color: "#607d8b", hecho: false },
  { id: 4, texto: "Poda preventiva sector sur",       etiqueta: "Semana",  color: "#607d8b", hecho: false },
  { id: 5, texto: "Calibrar sensores de suelo",       etiqueta: "Urgente", color: "#e05c2a", hecho: false },
  { id: 6, texto: "Reunión con proveedor semillas",   etiqueta: "Hoy",     color: "#4caf50", hecho: false },
];

/**
 * @typedef  {Object} ItemMenu
 * @property {string}        label  - Texto visible del ítem.
 * @property {string}        key    - Identificador único del ítem.
 * @property {string|null}   icono  - Emoji opcional junto al texto.
 * @property {string[]|null} sub    - Subitems del dropdown, o null si no tiene.
 */

/**
 * @constant {ItemMenu[]} ITEMS_MENU
 * Definición de la estructura completa del menú de navegación.
 * Los ítems con `sub` muestran un dropdown al pasar el mouse.
 */
const ITEMS_MENU = [
  { label: "INICIO",          key: "inicio",       sub: null },
  { label: "CULTIVOS",        key: "cultivos",    icono: null, sub: null },
  { label: "OPERACIONES",     key: "operaciones", icono: null, sub: ["Sistema de Riego", "Cámaras", "Clima"] },
  { label: "TAREAS",          key: "tareas",      icono: null, sub: null },
  { label: "INVENTARIO",      key: "inventario",  icono: null, sub: null },
  { label: "REPORTES",        key: "reportes",    icono: null, sub: null },
  { label: "ADMINISTRACIÓN",  key: "admin",       icono: null, sub: ["Jornales", "Contabilidad"] },
];

// ===========================================================================
// SECCIÓN 2 – PALETA DE COLORES
// ---------------------------------------------------------------------------
// Centralizar los colores facilita el mantenimiento y la consistencia visual.
// ===========================================================================

/**
 * @constant {Object} COLORES
 * Paleta de colores de la aplicación.
 */
const COLORES = {
  verdeOscuro:      "#1b5e20",
  verdeMedio:       "#2e7d32",
  verdeMenu:        "#388e3c",
  verdeActivo:      "#4a9b4a",
  azulRiego:        "#5b8dd9",
  naranja:          "#e8621a",
  amarillo:         "#f5c518",
  grisTareas:       "#b0bec5",
  fondoPagina1:     "#2d5a1b",
  fondoPagina2:     "#4a7c2f",
  fondoPagina3:     "#8bc34a",
  footerFondo:      "#1a3a0a",
  footerTexto:      "#aed581",
  blanco:           "#ffffff",
  negro:            "#111111",
};

// ===========================================================================
// SECCIÓN 3 – SUBCOMPONENTES
// ---------------------------------------------------------------------------
// Cada componente tiene una única responsabilidad (SRP).
// ===========================================================================

// ---------------------------------------------------------------------------
// 3.1 Navbar
// ---------------------------------------------------------------------------

/**
 * @component Navbar
 * @description Barra de navegación superior de la aplicación.
 *              Contiene el logo, el nombre, el menú principal con dropdowns
 *              y el avatar del usuario.
 *
 * @param {Object}   props
 * @param {string|null} props.menuAbierto    - Key del ítem con dropdown abierto.
 * @param {Function}    props.setMenuAbierto - Setter para abrir/cerrar dropdowns.
 *
 * @returns {JSX.Element} Elemento <nav> con todas las secciones de navegación.
 */
function Navbar({ menuAbierto, setMenuAbierto }) {
  return (
    <nav style={estilos.navbar} role="navigation" aria-label="Menú principal">

      {/* ── Franja superior: logo y avatar ── */}
      <div style={estilos.navTop}>

        {/* Logo y nombre de la aplicación */}
        <div style={estilos.navBrand} aria-label="AgroSoft inicio">
            <span aria-hidden="true" style={{ fontSize: 22 }}>🌿</span>
          <span style={estilos.brandName}>AgroSoft</span>
        </div>

        {/* Avatar del usuario autenticado */}
        <button
          style={estilos.avatar}
          aria-label="Perfil de usuario"
          title="Ver perfil"
        >
          👤
        </button>
      </div>

      {/* ── Barra de ítems del menú principal ── */}
      <div style={estilos.navMenu} role="menubar">
        {ITEMS_MENU.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            estaAbierto={menuAbierto === item.key}
            onMouseEnter={() => item.sub && setMenuAbierto(item.key)}
            onMouseLeave={() => setMenuAbierto(null)}
          />
        ))}
      </div>

    </nav>
  );
}

// ---------------------------------------------------------------------------
// 3.2 NavItem
// ---------------------------------------------------------------------------

/**
 * @component NavItem
 * @description Ítem individual del menú de navegación.
 *              Si tiene subitems (`item.sub`), muestra un dropdown al hacer hover.
 *
 * @param {Object}      props
 * @param {ItemMenu}    props.item         - Datos del ítem (label, key, icono, sub).
 * @param {boolean}     props.estaAbierto  - Si el dropdown de este ítem está visible.
 * @param {Function}    props.onMouseEnter - Callback al entrar el cursor al ítem.
 * @param {Function}    props.onMouseLeave - Callback al salir el cursor del ítem.
 *
 * @returns {JSX.Element} Contenedor con botón y dropdown opcional.
 */
function NavItem({ item, estaAbierto, onMouseEnter, onMouseLeave }) {
  return (
    <div
      style={estilos.navItemWrapper}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menuitem"
    >
      {/* Botón principal del ítem */}
      <button
        style={{
          ...estilos.navItem,
          background: estaAbierto ? "rgba(0,0,0,0.25)" : "transparent",
        }}
        aria-haspopup={Boolean(item.sub)}
        aria-expanded={estaAbierto}
      >
        {/* Ícono opcional (solo "Inicio" lo tiene) */}
        {item.icono && (
          <span aria-hidden="true" style={{ marginRight: 4 }}>
            {item.icono}
          </span>
        )}

        {item.label}

        {/* Indicador visual de que el ítem tiene submenú */}
        {item.sub && (
          <span aria-hidden="true" style={{ marginLeft: 4 }}>▾</span>
        )}
      </button>

      {/* Dropdown: visible solo cuando estaAbierto es true */}
      {item.sub && estaAbierto && (
        <div style={estilos.dropdown} role="menu" aria-label={`Submenú ${item.label}`}>
          {item.sub.map((subLabel) => (
            <button
              key={subLabel}
              style={estilos.dropdownItem}
              role="menuitem"
            >
              {subLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3.3 PanelAlertas
// ---------------------------------------------------------------------------

/**
 * @component PanelAlertas
 * @description Muestra las alertas críticas activas del sistema agrícola.
 *              Cada alerta es un aviso que requiere atención inmediata del
 *              operario (heladas, falta de insumos, sensores offline, etc.).
 *
 * @returns {JSX.Element} Tarjeta naranja con lista de alertas activas.
 */
function PanelAlertas() {
  return (
    <section
      style={{ ...estilos.card, background: COLORES.naranja }}
      aria-label="Panel de alertas"
    >
      {/* Etiqueta de sección */}
      <p style={estilos.cardLabel}>PANEL DE ALERTAS</p>
      <h2 style={estilos.cardTitle}>Alertas importantes</h2>

      {/* Lista de alertas: se itera sobre la constante ALERTAS */}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {ALERTAS.map((alerta) => (
          <li key={alerta.id} style={estilos.alertaItem} role="alert">
            {/* Punto decorativo de alerta */}
            <span aria-hidden="true" style={estilos.alertaDot}>●</span>
            <span style={{ fontSize: 13 }}>{alerta.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3.4 ClimaLocal
// ---------------------------------------------------------------------------

/**
 * @component ClimaLocal
 * @description Muestra las condiciones climáticas actuales de la ubicación
 *              de la granja (temperatura, descripción, humedad y lluvia).
 *              En producción, estos datos vendrían de una API meteorológica.
 *
 * @returns {JSX.Element} Tarjeta amarilla con datos meteorológicos.
 */
function ClimaLocal() {
  return (
    <section
      style={{ ...estilos.card, background: COLORES.amarillo, color: "#333" }}
      aria-label="Clima local"
    >
      {/* Etiqueta de sección */}
      <p style={{ ...estilos.cardLabel, color: "#555" }}>CLIMA LOCAL</p>
      <h2 style={{ ...estilos.cardTitle, color: "#222" }}>Medellín, CO</h2>

      {/* Temperatura principal en grados Celsius */}
      <p style={estilos.temperaturaGrande}>22°C</p>

      {/* Descripción textual del estado del cielo y viento */}
      <p style={estilos.climaDescripcion}>
        Parcialmente nublado · Viento 14 km/h
      </p>

      {/* Fila con métricas secundarias: humedad relativa y prob. de lluvia */}
      <div style={{ display: "flex", gap: 8 }}>
        <ClimaMetrica icono="💧" valor="68%" etiqueta="humedad" />
        <ClimaMetrica icono="🌧" valor="30%" etiqueta="lluvia"  />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3.5 ClimaMetrica
// ---------------------------------------------------------------------------

/**
 * @component ClimaMetrica
 * @description Pastilla de métrica secundaria del clima (humedad o lluvia).
 *
 * @param {Object} props
 * @param {string} props.icono    - Emoji representativo de la métrica.
 * @param {string} props.valor    - Porcentaje o valor a mostrar.
 * @param {string} props.etiqueta - Nombre de la métrica (ej. "humedad").
 *
 * @returns {JSX.Element} Caja con ícono, valor y etiqueta descriptiva.
 */
function ClimaMetrica({ icono, valor, etiqueta }) {
  return (
    <div style={estilos.climaMetrica}>
      <span aria-hidden="true">{icono}</span>
      <strong> {valor}</strong>
      <br />
      <small>{etiqueta}</small>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3.6 ResumenCultivos
// ---------------------------------------------------------------------------

/**
 * @component ResumenCultivos
 * @description Grilla de 6 métricas que resumen el estado general de todos
 *              los cultivos activos: parcelas, salud, cosechas, área, etc.
 *
 * @returns {JSX.Element} Tarjeta verde con grilla de estadísticas 3×2.
 */
function ResumenCultivos() {
  return (
    <section
      style={{ ...estilos.card, background: COLORES.verdeActivo }}
      aria-label="Resumen de cultivos"
    >
      <p style={estilos.cardLabel}>ESTADO GENERAL</p>
      <h2 style={estilos.cardTitle}>Resumen de cultivos</h2>

      {/* Grilla de 3 columnas × 2 filas con las métricas */}
      <div style={estilos.statsGrid} role="list">
        {METRICAS_CULTIVOS.map((metrica) => (
          <TarjetaMetrica
            key={metrica.label}
            valor={metrica.valor}
            label={metrica.label}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3.7 TarjetaMetrica
// ---------------------------------------------------------------------------

/**
 * @component TarjetaMetrica
 * @description Celda individual de la grilla de cultivos.
 *              Muestra un valor grande (número o porcentaje) y su etiqueta.
 *
 * @param {Object} props
 * @param {string} props.valor - Dato principal (ej. "87%", "12").
 * @param {string} props.label - Descripción del dato (ej. "Salud promedio").
 *
 * @returns {JSX.Element} Caja con valor en grande y etiqueta debajo.
 */
function TarjetaMetrica({ valor, label }) {
  return (
    <div style={estilos.statCard} role="listitem" aria-label={`${label}: ${valor}`}>
      <span style={estilos.statValor}>{valor}</span>
      <span style={estilos.statLabel}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3.8 EstadoRiego
// ---------------------------------------------------------------------------

/**
 * @component EstadoRiego
 * @description Muestra y controla el estado de activación de las zonas de riego.
 *              El usuario puede hacer clic en una zona para activarla o desactivarla.
 *              El estado es local al componente; en producción se sincronizaría
 *              con el controlador de riego vía WebSocket o MQTT.
 *
 * @returns {JSX.Element} Tarjeta azul con tarjetas de zona interactivas.
 */
function EstadoRiego() {
  /**
   * @type {[Object.<string, boolean>, Function]}
   * Mapa de zona → booleano que indica si está activa.
   * Valor inicial: Zona A encendida, el resto apagadas.
   */
  const [zonasActivas, setZonasActivas] = useState(
    Object.fromEntries(ZONAS_RIEGO.map((z, i) => [z, i === 0]))
  );

  /**
   * @function alternarZona
   * @description Invierte el estado de activación de una zona de riego.
   * @param {string} nombreZona - Nombre de la zona a alternar.
   * @returns {void}
   */
  function alternarZona(nombreZona) {
    setZonasActivas((prev) => ({
      ...prev,
      [nombreZona]: !prev[nombreZona],
    }));
  }

  return (
    <section
      style={{ ...estilos.card, background: COLORES.azulRiego }}
      aria-label="Estado del sistema de riego"
    >
      <p style={estilos.cardLabel}>SISTEMA DE RIEGO</p>
      <h2 style={estilos.cardTitle}>Estado de riego</h2>

      {/* Fila de tarjetas, una por zona de riego */}
      <div style={estilos.riegoGrid} role="list">
        {ZONAS_RIEGO.map((zona) => (
          <TarjetaZona
            key={zona}
            nombre={zona}
            activa={Boolean(zonasActivas[zona])}
            onToggle={() => alternarZona(zona)}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3.9 TarjetaZona
// ---------------------------------------------------------------------------

/**
 * @component TarjetaZona
 * @description Tarjeta interactiva que representa una zona del sistema de riego.
 *              Muestra su estado (activa/inactiva) mediante color e ícono,
 *              y permite alternarlo con un clic.
 *
 * @param {Object}   props
 * @param {string}   props.nombre   - Nombre de la zona (ej. "Zona A").
 * @param {boolean}  props.activa   - Si la zona está actualmente encendida.
 * @param {Function} props.onToggle - Callback al hacer clic para cambiar estado.
 *
 * @returns {JSX.Element} Botón estilizado como tarjeta de zona de riego.
 */
function TarjetaZona({ nombre, activa, onToggle }) {
  return (
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props
    <button
      onClick={onToggle}
      style={{
        ...estilos.riegoZona,
        background: activa
          ? "rgba(80,200,80,0.55)"   /* Verde semitransparente: zona activa */
          : "rgba(255,255,255,0.25)", /* Blanco semitransparente: zona inactiva */
      }}
      aria-pressed={activa}
      aria-label={`${nombre}: ${activa ? "activa" : "inactiva"}. Clic para alternar`}
      title={`${activa ? "Desactivar" : "Activar"} ${nombre}`}
      role="listitem"
    >
      {/* Ícono de agua si activa, círculo vacío si inactiva */}
      <span aria-hidden="true" style={{ fontSize: 20 }}>
        {activa ? "💧" : "⭕"}
      </span>
      <span style={{ fontSize: 11, marginTop: 4 }}>{nombre}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// 3.10 ListaTareas
// ---------------------------------------------------------------------------

/**
 * @component ListaTareas
 * @description Panel lateral con las tareas pendientes del operario.
 *              Permite marcar cada tarea como completada mediante un checkbox.
 *              Al completarse, el texto aparece tachado visualmente.
 *              El estado persiste mientras la sesión esté activa.
 *
 * @returns {JSX.Element} Tarjeta gris con lista de tareas interactivas.
 */
function ListaTareas() {
  /**
   * @type {[Tarea[], Function]}
   * Lista de tareas con su estado de completado.
   */
  const [tareas, setTareas] = useState(TAREAS_INICIALES);

  /**
   * @function marcarTarea
   * @description Alterna el estado `hecho` de la tarea con el id indicado.
   *              Usa inmutabilidad: crea un nuevo arreglo en lugar de mutar.
   * @param {number} id - Identificador único de la tarea a alternar.
   * @returns {void}
   */
  function marcarTarea(id) {
    setTareas((prev) =>
      prev.map((tarea) =>
        tarea.id === id ? { ...tarea, hecho: !tarea.hecho } : tarea
      )
    );
  }

  return (
    <aside
      style={{ ...estilos.card, background: COLORES.grisTareas, color: "#222" }}
      aria-label="Lista de tareas pendientes"
    >
      <p style={{ ...estilos.cardLabel, color: "#444" }}>PENDIENTES</p>
      <h2 style={{ ...estilos.cardTitle, color: COLORES.negro }}>Lista de tareas</h2>

      {/* Lista de tareas: cada fila tiene checkbox, texto y etiqueta */}
      <ul style={estilos.listaTareas} aria-label="Tareas">
        {tareas.map((tarea) => (
          <FilaTarea
            key={tarea.id}
            tarea={tarea}
            onChange={() => marcarTarea(tarea.id)}
          />
        ))}
      </ul>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// 3.11 FilaTarea
// ---------------------------------------------------------------------------

/**
 * @component FilaTarea
 * @description Fila individual de una tarea pendiente.
 *              Contiene un checkbox de completado, el texto de la tarea
 *              (tachado si está hecha) y una etiqueta de prioridad coloreada.
 *
 * @param {Object}   props
 * @param {Tarea}    props.tarea    - Objeto con los datos de la tarea.
 * @param {Function} props.onChange - Callback al cambiar el checkbox.
 *
 * @returns {JSX.Element} Elemento <li> con la fila de la tarea.
 */
function FilaTarea({ tarea, onChange }) {
  return (
    <li style={estilos.tareaRow}>
      {/* Checkbox: marca la tarea como completada */}
      <input
        type="checkbox"
        id={`tarea-${tarea.id}`}
        checked={tarea.hecho}
        onChange={onChange}
        style={{ marginRight: 8, cursor: "pointer", flexShrink: 0 }}
        aria-label={`Marcar "${tarea.texto}" como ${tarea.hecho ? "pendiente" : "completada"}`}
      />

      {/* Texto de la tarea: se tacha visualmente cuando está completada */}
      <label
        htmlFor={`tarea-${tarea.id}`}
        style={{
          flex: 1,
          fontSize: 12,
          cursor: "pointer",
          textDecoration: tarea.hecho ? "line-through" : "none",
          color: tarea.hecho ? "#777" : "#222",
        }}
      >
        {tarea.texto}
      </label>

      {/* Etiqueta de prioridad con su color correspondiente */}
      <span
        style={{ ...estilos.etiqueta, background: tarea.color }}
        aria-label={`Prioridad: ${tarea.etiqueta}`}
      >
        {tarea.etiqueta}
      </span>
    </li>
  );
}

// ===========================================================================
// SECCIÓN 4 – COMPONENTE RAÍZ
// ---------------------------------------------------------------------------
// AgroSoft ensambla todos los subcomponentes en el layout final de dos
// columnas y gestiona el estado compartido del menú de navegación.
// ===========================================================================

/**
 * @component AgroSoft
 * @description Componente raíz del dashboard. Gestiona el estado global del
 *              menú abierto y compone la interfaz con todos los paneles.
 *
 * @returns {JSX.Element} Aplicación completa con navbar, contenido y footer.
 */
export default function AgroSoft() {
  /**
   * @type {[string|null, Function]}
   * Key del ítem de menú cuyo dropdown está actualmente visible.
   * null significa que ningún dropdown está abierto.
   */
  const [menuAbierto, setMenuAbierto] = useState(null);

  return (
    <div style={estilos.root}>

      {/* ── BARRA DE NAVEGACIÓN ── */}
      <Navbar
        menuAbierto={menuAbierto}
        setMenuAbierto={setMenuAbierto}
      />

      {/* ── ÁREA DE CONTENIDO PRINCIPAL ── */}
      <main style={estilos.main}>

        {/* Columna izquierda: alertas, clima, cultivos y riego (flex 3) */}
        <div style={estilos.colLeft}>

          {/* Primera fila: panel de alertas + widget de clima en paralelo */}
          <div style={estilos.filaDoble}>
            <div style={{ flex: 2 }}><PanelAlertas /></div>
            <div style={{ flex: 1 }}><ClimaLocal /></div>
          </div>

          {/* Segunda fila: resumen estadístico de todos los cultivos */}
          <ResumenCultivos />

          {/* Tercera fila: control visual del sistema de riego por zonas */}
          <EstadoRiego />
        </div>

        {/* Columna derecha: lista de tareas pendientes (flex 1) */}
        <div style={estilos.colRight}>
          <ListaTareas />
        </div>

      </main>

      {/* ── PIE DE PÁGINA ── */}
      <footer style={estilos.footer} role="contentinfo">
        <span>© {APP_YEAR} AgroSoft · Todos los derechos reservados</span>
        <span>{APP_VERSION} · Última sync: hace 3 min</span>
      </footer>

    </div>
  );
}

// ===========================================================================
// SECCIÓN 5 – ESTILOS
// ---------------------------------------------------------------------------
// Objeto de estilos en línea (CSS-in-JS básico). Cada clave corresponde
// a un grupo visual del componente que lo referencia.
// En proyectos grandes se recomienda migrar a CSS Modules o Styled Components.
// ===========================================================================

/**
 * @constant {Object} estilos
 * @description Mapa de estilos de la aplicación.
 *              Organizados en el mismo orden que aparecen en el DOM:
 *              raíz → navbar → contenido → componentes → footer.
 */
const estilos = {

  /* ── Raíz ── */

  /** Contenedor raíz: altura mínima completa, degradado verde de fondo */
  root: {
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    background: `linear-gradient(135deg, ${COLORES.fondoPagina1} 0%, ${COLORES.fondoPagina2} 40%, ${COLORES.fondoPagina3} 100%)`,
    display: "flex",
    flexDirection: "column",
  },

  /* ── Navbar ── */

  /** Barra de navegación: fondo verde oscuro, sombra para separar del contenido */
  navbar: {
    background: COLORES.verdeMedio,
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },

  /** Franja del logo: fondo aún más oscuro, logo a la izq., avatar a la der. */
  navTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 24px",
    background: COLORES.verdeOscuro,
  },

  /** Grupo logo + nombre con separación por gap */
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: COLORES.blanco,
    textDecoration: "none",
  },

  /** Tipografía del nombre de la aplicación */
  brandName: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1,
    color: COLORES.blanco,
  },

  /** Botón/círculo del avatar: tamaño fijo, forma circular */
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#546e7a",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    color: COLORES.blanco,
    cursor: "pointer",
  },

  /** Contenedor de los ítems del menú: fila horizontal */
  navMenu: {
    display: "flex",
    gap: 2,
    padding: "0 12px",
    background: COLORES.verdeMenu,
  },

  /** Wrapper relativo de cada ítem (necesario para el dropdown absoluto) */
  navItemWrapper: {
    position: "relative",
  },

  /** Botón de ítem del menú: sin borde, texto blanco, fondo transparente */
  navItem: {
    background: "transparent",
    border: "none",
    color: COLORES.blanco,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
  },

  /** Panel del submenú: absoluto debajo del ítem padre, con sombra */
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    background: COLORES.blanco,
    border: "1px solid #ddd",
    borderRadius: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    minWidth: 160,
  },

  /** Botón de cada opción dentro del dropdown */
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #f0f0f0",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    color: COLORES.verdeMedio,
    fontWeight: 600,
  },

  /* ── Layout principal ── */

  /** Área de contenido: fila de dos columnas con espacio entre ellas */
  main: {
    display: "flex",
    gap: 16,
    padding: "16px 24px",
    flex: 1,
    alignItems: "flex-start",
  },

  /** Columna izquierda: apila los paneles verticalmente */
  colLeft: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  /** Columna derecha: ancho fijo mínimo para la lista de tareas */
  colRight: {
    flex: 1,
    minWidth: 220,
  },

  /** Fila que coloca alertas y clima uno al lado del otro */
  filaDoble: {
    display: "flex",
    gap: 16,
  },

  /* ── Tarjetas ── */

  /** Estilo base de todas las tarjetas/secciones del dashboard */
  card: {
    borderRadius: 12,
    padding: "16px 20px",
    color: COLORES.blanco,
    boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
  },

  /** Texto de categoría en mayúsculas sobre el título */
  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    opacity: 0.8,
    margin: "0 0 4px",
  },

  /** Título principal de la tarjeta */
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 12px",
  },

  /* ── PanelAlertas ── */

  /** Fila de una alerta: punto + texto */
  alertaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.18)",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 6,
  },

  /** Punto circular indicador de alerta */
  alertaDot: {
    fontSize: 10,
    color: COLORES.blanco,
    flexShrink: 0,
  },

  /* ── ClimaLocal ── */

  /** Temperatura principal: número grande y negrita */
  temperaturaGrande: {
    fontSize: 42,
    fontWeight: 800,
    margin: "4px 0",
    color: COLORES.negro,
  },

  /** Descripción textual del clima (estado del cielo y viento) */
  climaDescripcion: {
    fontSize: 12,
    color: "#444",
    margin: "0 0 12px",
  },

  /** Pastilla de métrica secundaria del clima */
  climaMetrica: {
    flex: 1,
    background: "rgba(0,0,0,0.12)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
    lineHeight: 1.6,
  },

  /* ── ResumenCultivos ── */

  /** Grilla de 3 columnas para las métricas */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  /** Celda individual de métrica */
  statCard: {
    background: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: "12px 8px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  /** Número grande dentro de la celda de métrica */
  statValor: {
    fontSize: 22,
    fontWeight: 800,
  },

  /** Descripción debajo del número */
  statLabel: {
    fontSize: 11,
    opacity: 0.85,
  },

  /* ── EstadoRiego ── */

  /** Fila de tarjetas de zona, con wrapping en pantallas pequeñas */
  riegoGrid: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  /** Tarjeta/botón de zona de riego individual */
  riegoZona: {
    flex: 1,
    minWidth: 70,
    borderRadius: 8,
    padding: "14px 8px",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: COLORES.blanco,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.25s ease",
  },

  /* ── ListaTareas ── */

  /** Contenedor sin estilo de la lista de tareas */
  listaTareas: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  /** Fila de tarea: checkbox + texto + etiqueta */
  tareaRow: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.4)",
    borderRadius: 8,
    padding: "8px 10px",
    gap: 4,
  },

  /** Etiqueta de prioridad de la tarea: pastilla redondeada con color */
  etiqueta: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 10,
    color: COLORES.blanco,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  /* ── Footer ── */

  /** Pie de página: fondo muy oscuro, texto verde claro */
  footer: {
    background: COLORES.footerFondo,
    color: COLORES.footerTexto,
    fontSize: 11,
    padding: "8px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
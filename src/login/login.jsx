import React from "react";
import axios from "axios";
import "./login.css";
import logo from "./logo.png";
import { useState } from "react";

function Login() {

    const [mostrarLogin, setMostrarLogin] = useState(false);
    //en esta parte se guardan los datos del usuario que se va a registrar
    const [usuario, setUsuario] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");

    // Guarda el usuario que escribe en el login
const [usuarioLogin, setUsuarioLogin] = useState("");

// Guarda la contraseña que escribe en el login
const [contrasenaLogin, setContrasenaLogin] = useState("");

    //esta funcion se encarga de registrar un nuevo usuario en la base de datos
    const registrarUsuario = async (e) => {
    e.preventDefault();

    if (!usuario || !correo || !contrasena) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {

        // Verificar si el usuario ya existe
        const respuesta = await axios.get("http://localhost:3001/usuarios");

        const usuarioExiste = respuesta.data.find(
            (u) => u.usuario === usuario
        );

        if (usuarioExiste) {
            alert("Ese nombre de usuario ya existe");
            return;
        }

        // Guardar el nuevo usuario
        await axios.post("http://localhost:3001/usuarios", {
            usuario,
            correo,
            contrasena
        });

        alert("Usuario registrado correctamente");

        // Limpiar formulario
        setUsuario("");
        setCorreo("");
        setContrasena("");

        // Cambiar al formulario de inicio de sesión
        setMostrarLogin(true);

    } catch (error) {
        console.error(error);
        alert("Error al registrar el usuario");
    }
};

// Función para iniciar sesión
const iniciarSesion = async (e) => {

    // Evita que el formulario recargue la página
    e.preventDefault();

    try {

        // Obtener todos los usuarios registrados
        const respuesta = await axios.get("http://localhost:3001/usuarios");

        // Buscar un usuario que tenga el mismo usuario y contraseña
        const usuarioEncontrado = respuesta.data.find(
            (u) =>
                u.usuario === usuarioLogin &&
                u.contrasena === contrasenaLogin
        );

        // Si existe...
        if (usuarioEncontrado) {

            alert("Bienvenido " + usuarioEncontrado.usuario);
            
            // Aquí después abriremos el menú principal

        } else {

            alert("Usuario o contraseña incorrectos");

        }

    } catch (error) {

        console.log(error);

        alert("Error al iniciar sesión");

    }

};
    return (
        <>
            <div className={`container-form sign-in ${mostrarLogin ? "active" : ""}`}>
                <form className="formulario" onSubmit={iniciarSesion}>
                    <h2 className="create-cuenta">Iniciar sesión</h2>

                    <div className="iconos">
                        <div className="border-icon">
                            <i className="bx bxl-facebook"></i>
                        </div>

                        <div className="border-icon">
                            <i className="bx bxl-instagram"></i>
                        </div>

                        <div className="border-icon">
                            <i className="bx bxl-whatsapp"></i>
                        </div>
                    </div>

                    <p className="cuenta-gratis">¿Aún no tienes cuenta?</p>

                    <input
                        type="text"
                        placeholder="Usuario"
                            // Valor del input
                            value={usuarioLogin}

                            // Guarda lo que escribe el usuario
                        onChange={(e) => setUsuarioLogin(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        // Valor del input
                            value={contrasenaLogin}
                            // Guarda lo que escribe el usuario
                        onChange={(e) => setContrasenaLogin(e.target.value)}
                    />

                    <input
                        type="submit"
                        value="Iniciar sesión"
                        
                    />
                </form>

                <div className="welcome-back">
                    <div className="mensaje">
                        <img src={logo} alt="Logo" />

                        <h2>Bienvenidos a AgroSoft</h2>

                        <p>Si aún no tienes una cuenta por favor regístrate aquí</p>

                        <button className="sign-in-btn" onClick={() => setMostrarLogin(false)}>
                            Registrarse
                        </button>
                    </div>
                </div>
            </div>

            <div className={`container-form sign-up ${!mostrarLogin ? "" : "active"}`}>
                <div className="welcome-back">
                    <div className="mensaje">
                        <img src={logo} alt="Logo" />

                        <h2>Bienvenidos a AgroSoft</h2>

                        <p>Si ya tienes una cuenta por favor inicia sesión aquí</p>

                        <button className="sign-up-btn" onClick={() => setMostrarLogin(true)}>
                            Iniciar sesión
                        </button>
                    </div>
                </div>

                <form className="formulario" onSubmit={registrarUsuario}>
                    <h2 className="create-cuenta">Crear una cuenta</h2>

                    <div className="iconos">
                        <div className="border-icon">
                            <i className="bx bxl-facebook"></i>
                        </div>

                        <div className="border-icon">
                            <i className="bx bxl-instagram"></i>
                        </div>

                        <div className="border-icon">
                            <i className="bx bxl-whatsapp"></i>
                        </div>
                    </div>

                    <p className="cuenta-gratis">
                        Crear una cuenta gratis
                    </p>

                    <input
                        type="text"
                        placeholder="Nombre de Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                    />

                    <input
                        type="submit"
                        value="Registrarse"
                    />
                </form>
            </div>
        </>
    );
}

export default Login;
        
import Login from "./login/login";
import MenuPrincipal from "./menu-principal";

function App() {

  const logueado = false;

  return (
    <>
      {logueado ? <MenuPrincipal /> : <Login />}
    </>
  );
}

export default App;

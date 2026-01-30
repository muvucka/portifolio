import { useNavigate } from "react-router-dom";
import "./Login.css"

function Login() {

const navigate = useNavigate();
  return (
    <div className="login-page" >
        <form className="login-card" action="/pagina-login" method='post'>
          <div>
            <h1>Entrar</h1>
            <h5 >Nucleo para Arquivo de Games e Organização</h5>
            <input type="email" placeholder="Entre com seu email" id="email" />

            <input type="password" placeholder='Entre com sua senha' id="senha"/>
          </div>
          <div>
            <button type="submit" onClick={() => navigate("/Home")}>
              Entrar
            </button>
          </div>
        </form>
        
    </div>
  )
}

export default Login

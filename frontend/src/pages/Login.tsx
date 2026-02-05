import { useNavigate } from "react-router-dom";
import "./Login.css"
import { GiDiceFire } from "react-icons/gi";

function Login() {

const navigate = useNavigate();
  return (
    <div className="login-page" >
      <div className="top-left-icon">
        <img src="/beholder.svg" alt="Beholder" width={120} height={120} />
      </div>
      <button className="register-button" type="submit" onClick={() => navigate("./register")}>
        Inscrever-se
      </button>
      <form className="login-card" action="/pagina-login" method='post'>
        <div>
          <h1>Entrar</h1>
          <h5 >Entre no NAGO com seu email e senha, ou crie uma conta</h5>
          <input type="email" placeholder="Entre com seu email" id="email" />

          <input type="password" placeholder='Entre com sua senha' id="senha"/>
        </div>
          <div>
            <button type="submit" onClick={() => navigate("/home")}>
              Entrar
            </button>
          </div>
            <div className="icons">
              <GiDiceFire /> <h5>Sonw</h5>
            </div>
        </form>
        
    </div>
  )
}

export default Login

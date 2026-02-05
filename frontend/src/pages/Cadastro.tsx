import { useNavigate } from "react-router-dom";
import "./Cadastro.css"
import { GiDiceFire } from "react-icons/gi";

function Register() {

const navigate = useNavigate();
  return (
    <div className="register-page" >
      <div className="top-left-icon">
        <img src="/beholder.svg" alt="Beholder" width={120} height={120} />
      </div>
      <form className="register-card" action="/pagina-register" method='post'>
        <div>
          <h1>Cadastrar</h1>
          <h5 >Crie uma conta nova no NAGO com seu email e senha</h5>
          <input type="email" placeholder="Cadastre um novo email" id="email" />

          <input type="password" placeholder='Cadastre uma nova senha' id="senha"/>
          
          <input type="password" placeholder='Confirme sua senha' id="senha"/>
        </div>
          <div>
            <button type="submit" onClick={() => navigate("/")}>
              Cadastrar
            </button>
          </div>
            <div className="icons">
              <GiDiceFire /> <h5>Sonw</h5>
            </div>
        </form>
        
    </div>
  )
}

export default Register

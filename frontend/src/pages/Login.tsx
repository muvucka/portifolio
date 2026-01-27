import { useNavigate } from "react-router-dom";



function Login() {

const navigate = useNavigate();
  return (
    <>
        <form action="/pagina-login" method='post'>
          <div>
            <h2>NAGO</h2>
            <h5>Nucleo para Arquivo de Games e Organização</h5>
            <label htmlFor="nome">Email:</label>
            <input type="email" placeholder='Entre com seu email' id='email'/>

            <label htmlFor='password'>Senha:</label>
            <input type="password" placeholder='Entre com sua senha' id="senha"/>
          </div>
        </form>
          <div className='button'>
            <button onClick={() => navigate("/Home")}>
              Entrar
            </button>
            <button type="submit">
              Cadastrar
            </button>
          </div>
        
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default Login

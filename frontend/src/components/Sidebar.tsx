import { NavLink } from "react-router-dom";

export default function Sidebar() {
    return(
        <aside>
            <h2>NAGO</h2>
            <nav>
                <NavLink to="/home">Inicio</NavLink>
                <NavLink to="/">Sair</NavLink>
            </nav>
        </aside>
    );
}
import { useNavigate } from "react-router-dom";
import { Section } from "../components/Section";
import type { Deck } from "../types/Deck";

const decksVtes: Deck[] = [
  {
    id: "1",
    name: "VTES Brujah",
    coverImage: "/cards/brujah.jpg",
    cardsCount: 62
  },
  {
    id: "2",
    name: "VTES Tremere",
    coverImage: "/cards/tremere.jpg",
    cardsCount: 60
  }
];

export default function Home () {
    const navigate = useNavigate();
    return(
        <div>
            <main>
                <h2>Menu</h2>
                    <h3>Gerenciamento de Decks</h3>
                    <Section
                    title="Decks Recentes"
                    itens={decksVtes}/>
                    
                    <Section
                    title="Decks VTES"
                    itens={decksVtes}/>
                    
                    <Section
                    title="Decks Magic"
                    itens={decksVtes}/>
                    <div><h5>Precons</h5></div>
                    <div><h5>Testes Vtes</h5></div>
                <section>
                    <button type="submit" onClick={() => navigate("/Home")}>Adicionar Deck</button>
                    <button type="submit" onClick={() => navigate("/Home")}>Deletar Deck</button>
                </section>
            </main>
        </div>
    );
}
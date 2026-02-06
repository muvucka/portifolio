import { useNavigate } from "react-router-dom";
import { Section } from "../components/Section";
import type { Deck } from "../types/Deck";
import "../pages/Home.css";
import brujah from "../assets/brujah.png";
import tremere from "../assets/tremere.jpg";

const decksVtes: Deck[] = [
  {
    id: "1",
    name: "VTES Brujah",
    coverImage: brujah,
    cardsCount: 62,
    category: 'commander',
    lastUpdatedAt: '2026-02-01T14:32:00Z'
  },
  {
    id: "2",
    name: "VTES Tremere",
    coverImage: tremere,
    cardsCount: 60,
    category: 'commander',
    lastUpdatedAt: '2026-02-01T14:32:00Z'
  }
];

export default function Home () {
    const navigate = useNavigate();
    return(
        <div className="home">
            <main className="content-wrapper">
                <div className="content-card">
                    <Section
                    title="Decks Recentes"
                    itens={decksVtes}/>
                    
                    <Section
                    title="Decks VTES"
                    itens={decksVtes}/>
                    
                    <Section
                    title="Decks Magic"
                    itens={decksVtes}/>
                </div>
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
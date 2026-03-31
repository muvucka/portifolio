import { DeckCard } from "./DeckCard";
import type { Deck } from "../types/Deck";
import "./Section.css";

interface SectionProps {
    itens: Deck[];
    section: "meus" | "proximos";
}


export function Section({ itens, section }: SectionProps) {
    console.log("SECTION ATUAL:", section);
    console.log("ITENS:", itens);
    

    const filtrados = itens.filter(
        deck => deck.section === section
    );

    return (
        <div className="carrosel">
            {filtrados.map(deck => (
                <DeckCard key={deck.id} deck={deck} />
            ))}
        </div>
    );
}
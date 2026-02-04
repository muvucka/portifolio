import { DeckCard } from "./DeckCard";
import type { Deck } from "../types/Deck";
import "./Section.css";

interface SectionProps {
    title: string;
    itens: Deck[];
}

export function Section({ title, itens }: SectionProps) {
    return (
        <section className="section">
            <h3>{title}</h3>

            <div className="carrosel">
                {itens.map(deck => (
                    <DeckCard key={deck.id} deck={deck}/>
                ))}
            </div>
        </section>
    )
}
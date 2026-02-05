import {useMemo, useState } from 'react';
import type { Deck } from '../types/Deck';
import sefris from "../assets/sefris.png";
import seasoned from "../assets/seasoned.png";

type GroupBy = 'none' | 'type' | 'cmc' | 'color';
type SortBy = 'name' | 'cmc' | 'quantity';

interface DeckCard {
    id: string;
    cardId: string;
    name: string;
    image?: string;
    quantity: number;
    typeLine: string;
    colors: string[];
    cmc: number;
}

interface DeckListResponse{
    deck: Deck;
    cards: DeckCard[];
}

const mockDeck: DeckListResponse = {
    deck: {
        id: '1',
        name: 'Sefris',
        coverImage: sefris,
        cardsCount: 100,
    },
    cards: [
        {
            id: 'dc1',
            cardId: 'c1',
            name: 'Sefris of the Hidden Ways',
            quantity: 1,
            typeLine: 'Legendary Creature - Human Wizard',
            colors: ['W', 'U', 'B'],
            cmc: 3,
            image: sefris,
        },
        {
            id:'dc2',
            cardId: 'c2',
            name: 'Seasoned Dungeoneer',
            quantity: 1,
            typeLine: 'Creature -  Human Warrior',
            colors: ['I', 'W'],
            cmc: 4,
            image: seasoned,
        },
    ],
};

export default function DeckList() {
    const [groupBy, setGroupBy] = useState<GroupBy>('type');
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [cards, setCards] = useState<DeckCard[]>(mockDeck.cards);


const groupedCards = useMemo(() => {
    const sorted = [...cards].sort((a,b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'cmc') return a.cmc - b.cmc;
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        return 0;
    });

    if (groupBy === 'none') {
        return {
            'All cards' : sorted,
        };
    }

    return sorted.reduce<Record<string, DeckCard[]>>((acc, card) => {
        let key = 'Other';

        if (groupBy === 'type') {
            key = card.typeLine.split('-')[0].trim();
        }
        if (groupBy === 'cmc') {
            key = `CMC ${card.cmc}`;
        }
        if (groupBy === 'color'){
            key = card.colors.length ? card.colors.join(', ') : 'Colorless';
        }

        acc[key] = acc[key] || [];
        acc[key].push(card);
        return acc;
    }, {});
}, [cards, groupBy, sortBy]);

function updateQuantity(deckCardId: string, delta:number) {
    setCards((prev) =>
    prev
        .map((c) =>
            c.id === deckCardId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
}

return (
    <div className='decklist-page'>
        {/* Header */}
        <header className='deck-header'>
            <h1>{mockDeck.deck.name}</h1>
            <span>{mockDeck.deck.cardsCount} cards</span>
        </header>

        {/* Controls */}
        <section className='deck-controls'>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
                <option value='type'>Group By Type</option>
                <option value='cmc'>Group By CMC</option>
                <option value='color'>Group By Color</option>
                <option value='none'>No Group</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value='name'>Sort by Name</option>
                <option value='cmc'>Sort by CMC</option>
                <option value='quantity'>Sort by Quantity</option>
            </select>
        </section>
        
        {/* Deck List */}
        <section className='deck-groups'>
            {Object.entries(groupedCards).map(([group, cards]) => (
                <div key={group} className='deck-group'>
                    <h2>{group}</h2>

                    <div className='card-grid'>
                        {cards.map((card) => (
                            <div key={card.id} className='deck-card'>
                                {card.image && <img src={card.image} alt={card.name} />}
                                <div className='card-info'>
                                    <strong>{card.name}</strong>
                                    <span>CMC {card.cmc}</span>

                                    <div className='quantity-controls'>
                                        <button onClick={() => updateQuantity(card.id, -1)}>-</button>
                                        <span>{card.quantity}</span>
                                        <button onClick={() => updateQuantity(card.id, +1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    </div>
);
}
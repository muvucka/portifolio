    import {useMemo, useState } from 'react';
    import type { Deck } from '../types/Deck';
    import { DeckHeader } from '../components/DeckHeader';
    import "../pages/DeckList.css";
    import sefris from "../assets/sefris.png";
    import seasoned from "../assets/seasoned.png";
    import tortured from "../assets/tortured.png";
    import { GiBeastEye, 
            GiUnfriendlyFire, 
            GiFocusedLightning, 
            GiMagicLamp, 
            GiSkullShield, 
            GiFluffyWing, 
            GiTriforce } from "react-icons/gi";

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
            category: 'commander',
            lastUpdatedAt: '2026-02-01T14:32:00Z',
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
            {
                id:'dc3',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            }, 
            {
                id: 'dc4',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc5',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc6',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc7',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc8',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc9',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc10',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc11',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc12',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc13',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc14',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc15',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id:'dc3',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            }, 
            {
                id: 'dc4',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc5',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc6',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc7',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc8',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc9',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc10',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc11',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc12',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc13',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc14',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc15',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id:'dc3',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            }, 
            {
                id: 'dc4',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc5',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc6',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc7',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc8',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc9',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc10',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc11',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc12',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
            {
                id: 'dc13',
                cardId: 'c1',
                name: 'Sefris of the Hidden Ways',
                quantity: 1,
                typeLine: 'Legendary Creature - Human Wizard',
                colors: ['W', 'U', 'B'],
                cmc: 3,
                image: sefris,
            },
            {
                id:'dc14',
                cardId: 'c2',
                name: 'Seasoned Dungeoneer',
                quantity: 1,
                typeLine: 'Creature -  Human Warrior',
                colors: ['I', 'W'],
                cmc: 4,
                image: seasoned,
            },
            {
                id:'dc15',
                cardId: 'c3',
                name: 'Tortured Existence',
                quantity: 1,
                typeLine: 'Enchantment',
                colors: ['B'],
                cmc: 1,
                image: tortured,
            },
        ],
    };

    export default function DeckList() {
        const [groupBy, setGroupBy] = useState<GroupBy>('type');
        const [sortBy, setSortBy] = useState<SortBy>('name');
        const [cards, setCards] = useState<DeckCard[]>(mockDeck.cards);

        function getGroupTotal(cards: DeckCard[]) {
            return cards.reduce((sum, card) => sum + card.quantity, 0);
        }

        function getGroupIcon (groupBy: GroupBy, group: string) {
            if (groupBy === 'type') {
                const g = group.toLowerCase();
                if (g.includes('creature')) return <GiBeastEye/>;
                if (g.includes('sorcery')) return <GiUnfriendlyFire />;
                if (g.includes('instant')) return <GiFocusedLightning />;
                if (g.includes('artifact')) return <GiMagicLamp />;
                if (g.includes('equipment')) return <GiSkullShield />;
                if (g.includes('enchantment')) return <GiFluffyWing />;
                return <GiTriforce />;
            }
        }


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

            if (groupBy === 'type') 
                {
                const typeLine = card.typeLine.toLowerCase(); // case insensitive
                    if (typeLine.includes('creature')) key = 'Creature';
                        else if (typeLine.includes('enchantment')) key = 'Enchantment';
                            else if (typeLine.includes('sorcery')) key = 'Sorcery';
                                else if (typeLine.includes('instant')) key = 'Instant';
                                    else if (typeLine.includes('artifact')) key = 'Artifact';
                                        else if (typeLine.includes('equipment')) key = 'Equipment';
                                            else if (typeLine.includes('land')) key = 'Land';
                                                else key = 'Other';
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
            <DeckHeader deck={mockDeck.deck}/> 

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
  {Object.entries(groupedCards).map(([group, cards]) => {

    const cardsPerRow = 6;
    const overlapOffset = 100;
    const cardHeight = 280;

    const rowsToShow = Math.ceil(cards.length / cardsPerRow);
    const gridHeight = cardHeight + (rowsToShow - 1) * overlapOffset;

    return (
      <div key={group} className='deck-group'>
        <h2 className="deck-group-title">
          {getGroupIcon(groupBy, group)}
          <span> {group} </span>
          <span className="deck-group-count">
            ({getGroupTotal(cards)})
          </span>
        </h2>

        <div
          className='card-grid'
          style={{ height: gridHeight }}
        >
          {cards.map(function(card, index) {

            const rowIndex = Math.floor(index / cardsPerRow);
            const colIndex = index % cardsPerRow;

            let topPosition;
            if (rowIndex > 0) {
              topPosition = rowIndex * overlapOffset + "px";
            } else {
              topPosition = undefined;
            }

            const zIndexValue = index;

            return (
              <div
                key={card.id + "_" + index}
                className='deck-card'
                style={{
                  left: colIndex * 180 + 'px',
                  top: topPosition,
                  zIndex: zIndexValue
                }}
              >
                {card.image ? <img src={card.image} alt={card.name} /> : null}

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
            );
          })}
        </div>
      </div>
    );
  })}
        </section>
        </div>
    );
    }
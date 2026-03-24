import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Deck } from "../types/Deck";
import { DeckHeader } from "../components/DeckHeader";
import "../pages/DeckList.css";
import type { ApiDeck } from "../adapter/deckAdapter.ts";
import { mapApiDeckToUI } from "../adapter/deckAdapter.ts";
import {
  GiBeastEye,
  GiUnfriendlyFire,
  GiFocusedLightning,
  GiMagicLamp,
  GiSkullShield,
  GiFluffyWing,
  GiTriforce,
  GiFireZone,
  GiWaterSplash,
  GiFluffyCloud,
  GiDreadSkull,
  GiAlienFire,
  GiBlackHoleBolas,
  GiSun,
} from "react-icons/gi";

type GroupBy = "none" | "type" | "cmc" | "color";
type SortBy = "name" | "cmc" | "quantity";

interface DeckCard {
  id: string;
  cardId: string;
  name: string;
  image?: string;
  quantity: number;
  typeLine: string;
  colors: string[];
  cmc: number;
  isCommander?: boolean;
}

const GROUP_ORDER: Record<GroupBy, string[]> = {
  type: [
    "Commander",
    "Creature",
    "Sorcery",
    "Instant",
    "Enchantment",
    "Artifact",
    "Equipment",
    "Land",
    "Sideboard",
  ],
  cmc: ["CMC 0", "CMC 1", "CMC 2", "CMC 3", "CMC 4", "CMC 5", "CMC 6+"],
  color: [
    "White",
    "Blue",
    "Black",
    "Red",
    "Green",
    "Multicolored",
    "Colorless",
  ],
  none: [],
};

const COLOR_ICONS: Record<string, React.ReactNode> = {
  White: <GiSun />,
  Blue: <GiWaterSplash />,
  Black: <GiDreadSkull />,
  Red: <GiFireZone />,
  Green: <GiAlienFire />,
  Multicolored: <GiBlackHoleBolas />,
  Colorless: <GiFluffyCloud />,
};

const COLOR_NAMES: Record<string, { icon: React.ReactNode; label: string }> = {
  W: { icon: <GiSun />, label: "White" },
  U: { icon: <GiWaterSplash />, label: "Blue" },
  B: { icon: <GiDreadSkull />, label: "Black" },
  R: { icon: <GiFireZone />, label: "Red" },
  G: { icon: <GiAlienFire />, label: "Green" },
};

export default function DeckList() {
  const { deckId } = useParams();
  const token = localStorage.getItem("accessToken");

  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [hoveredCard, setHoveredCard] = useState<DeckCard | null>(null);

  // Função fetchDeck com useCallback para garantir que ela não seja recriada a cada renderização
  const fetchDeck = useCallback(async () => {
    if (!deckId) {
      console.error("Deck ID não encontrado");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/decks/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiDeck = await res.json();
      const mapped = mapApiDeckToUI(data);

      setDeck(mapped.deck);
      setCards(mapped.cards);
    } catch (err) {
      console.error("Erro ao carregar deck:", err);
    }
  }, [deckId, token]);  // Dependências agora incluem deckId e token

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]); // Use fetchDeck no array de dependências

  const commanderCard = cards.find((c) => c.isCommander);

  const getGroupIcon = (groupBy: GroupBy, group: string) => {
    if (groupBy === "type") {
      const g = group.toLowerCase();
      if (g.includes("creature")) return <GiBeastEye />;
      if (g.includes("sorcery")) return <GiUnfriendlyFire />;
      if (g.includes("instant")) return <GiFocusedLightning />;
      if (g.includes("artifact")) return <GiMagicLamp />;
      if (g.includes("equipment")) return <GiSkullShield />;
      if (g.includes("enchantment")) return <GiFluffyWing />;
      return <GiTriforce />;
    }
    return null;
  };

  // UseMemo com as dependências corretas
  const groupedCards = useMemo(() => {
    const sorted = [...cards].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cmc") return a.cmc - b.cmc;
      if (sortBy === "quantity") return b.quantity - a.quantity;
      return 0;
    });

    if (groupBy === "none") return { "All cards": sorted };

    return sorted.reduce<Record<string, DeckCard[]>>((acc, card) => {
      let key = "Other";

      if (groupBy === "type") {
        const typeLine = card.typeLine.toLowerCase();
        if (card.isCommander) key = "Commander";
        else if (typeLine.includes("creature")) key = "Creature";
        else if (typeLine.includes("enchantment")) key = "Enchantment";
        else if (typeLine.includes("sorcery")) key = "Sorcery";
        else if (typeLine.includes("instant")) key = "Instant";
        else if (typeLine.includes("artifact")) key = "Artifact";
        else if (typeLine.includes("equipment")) key = "Equipment";
        else if (typeLine.includes("land")) key = "Land";
      }

      if (groupBy === "cmc") {
        key = card.cmc >= 6 ? "CMC 6+" : `CMC ${card.cmc}`;
      }

      if (groupBy === "color") {
        const realColors = card.colors;
        if (realColors.length === 0) key = "Colorless";
        else if (realColors.length === 1)
          key = COLOR_NAMES[realColors[0]]?.label || realColors[0];
        else key = "Multicolored";
      }

      acc[key] = acc[key] || [];
      acc[key].push(card);
      return acc;
    }, {});
  }, [cards, groupBy, sortBy]);

  function getGroupTotal(cards: DeckCard[]) {
    return cards.reduce((sum, card) => sum + card.quantity, 0);
  }

  // Atualiza a quantidade no backend
  const updateQuantity = async (deckCardId: string, newQuantity: number) => {
    try {
      const card = cards.find((c) => c.id === deckCardId);
      if (!card) return;

      const res = await fetch(
        `http://localhost:3000/decks/${deckId}/cards/${card.cardId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!res.ok) throw new Error("Erro ao atualizar");

      // Chama fetchDeck após atualizar a quantidade
      await fetchDeck();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar carta");
    }
  };

  const allGroups = [
    ...(GROUP_ORDER[groupBy].length ? GROUP_ORDER[groupBy] : []),
    ...Object.keys(groupedCards),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter((group) => groupedCards[group]);

  return (
    <div className="decklist-page">
      {deck && <DeckHeader deck={deck} />}
      <div className="decklist-layout">
        <aside className="hover-preview">
          {(hoveredCard ?? commanderCard) ? (
            <img
              src={(hoveredCard ?? commanderCard)?.image}
              alt={(hoveredCard ?? commanderCard)?.name}
            />
          ) : (
            <div className="hover-preview-placeholder">
              <span>Passe o mouse sobre o card para um preview</span>
            </div>
          )}
        </aside>

        <div className="decklist-content">
          <section className="deck-controls">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              <option value="type">Group By Type</option>
              <option value="cmc">Group By CMC</option>
              <option value="color">Group By Color</option>
              <option value="none">No Group</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="name">Sort by Name</option>
              <option value="cmc">Sort by CMC</option>
              <option value="quantity">Sort by Quantity</option>
            </select>
          </section>

          <section className="deck-groups">
            {allGroups.map((group) => {
              const groupCards = groupedCards[group];
              if (!groupCards) return null;

              const cardsPerRow = 6;
              const overlapOffset = 100;
              const cardHeight = 280;
              const rowsToShow = Math.ceil(groupCards.length / cardsPerRow);
              const gridHeight = cardHeight + (rowsToShow - 1) * overlapOffset;

              return (
                <div key={group} className="deck-group">
                  <h2 className="deck-group-title">
                    {groupBy === "color" ? (
                      <>
                        {COLOR_ICONS[group]} <span> {group} </span>
                      </>
                    ) : (
                      <>
                        {getGroupIcon(groupBy, group)} <span> {group} </span>
                      </>
                    )}
                    <span className="deck-group-count">
                      ({getGroupTotal(groupCards)})
                    </span>
                  </h2>

                  <div className="card-grid" style={{ height: gridHeight }}>
                    {groupCards.map((card, index) => {
                      const rowIndex = Math.floor(index / cardsPerRow);
                      const colIndex = index % cardsPerRow;
                      const topPosition =
                        rowIndex > 0 ? rowIndex * overlapOffset + "px" : undefined;

                      return (
                        <div
                          key={card.id + "_" + index}
                          className="deck-card"
                          style={{
                            left: colIndex * 180 + "px",
                            top: topPosition,
                            zIndex: index,
                          }}
                          onMouseEnter={() => setHoveredCard(card)}
                        >
                          {card.image && <img src={card.image} alt={card.name} />}
                          <div className="card-info">
                            <strong>{card.name}</strong>
                            <span>CMC {card.cmc}</span>
                            <div className="quantity-controls">
                              <button
                                onClick={() =>
                                  updateQuantity(card.id, card.quantity - 1)
                                }
                              >
                                -
                              </button>
                              <span>{card.quantity}</span>
                              <button
                                onClick={() =>
                                  updateQuantity(card.id, card.quantity + 1)
                                }
                              >
                                +
                              </button>
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
      </div>
    </div>
  );
}
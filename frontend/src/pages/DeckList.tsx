import { useEffect, useMemo, useState } from "react";
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
  GiAlienFire,
  GiBlackHoleBolas,
  GiSun,
  GiDeathZone,
  GiCrenelCrown,
} from "react-icons/gi";

type GroupBy = "none" | "type" | "cmc" | "colors";
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
    "Criaturas",
    "Magicas",
    "Instantaneas",
    "Encantamentos",
    "Artefatos",
    "Equipamentos",
    "Terrenos",
    "Sideboard",
  ],
  cmc: ["CMC 0", "CMC 1", "CMC 2", "CMC 3", "CMC 4", "CMC 5", "CMC 6+"],
  colors: [
  "Branca",
  "Azul",
  "Preta",
  "Vermelha",
  "Verde",
  "Multicoloridas",
  "Incolores",
],
  none: [],
};

const COLOR_ICONS: Record<string, React.ReactNode> = {
  Branca: <GiSun />,
  Azul: <GiWaterSplash />,
  Preta: <GiDeathZone />,
  Vermelha: <GiFireZone />,
  Verde: <GiAlienFire />,
  Multicoloridas: <GiBlackHoleBolas />,
  Incolores: <GiFluffyCloud />,
};

const COLOR_NAMES: Record<string, { icon: React.ReactNode; label: string }> = {
  W: { icon: <GiSun />, label: "Branca" },
  U: { icon: <GiWaterSplash />, label: "Azul" },
  B: { icon: <GiDeathZone />, label: "Preta" },
  R: { icon: <GiFireZone />, label: "Vermelha" },
  G: { icon: <GiAlienFire />, label: "Verde" },
};

export default function DeckList() {
  const { id } = useParams();
  const token = localStorage.getItem("accessToken");

  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [hoveredCard, setHoveredCard] = useState<DeckCard | null>(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
  if (id) {
    localStorage.setItem("lastDeckId", id);
  }
}, [id]);

  // Função fetchDeck com useCallback para garantir que ela não seja recriada a cada renderização
  useEffect(() => {
  if (!id) return;

  const fetchDeck = async () => {
    try {
      const res = await fetch(`${API}/decks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiDeck = await res.json();
      const mapped = mapApiDeckToUI(data);

      setDeck(mapped.deck);
      setCards(mapped.cards);
    } catch (err) {
      console.error("Erro ao carregar deck:", err);
    }
  };

  fetchDeck();
}, [id, token]);  // Dependências agora incluem id e token
 // Use fetchDeck no array de dependências

  const commanderCard = cards.find((c) => c.isCommander);

  const getGroupIcon = (groupBy: GroupBy, group: string) => {
    if (groupBy === "type") {
      const g = group.toLowerCase();
      if (g.includes("criaturas")) return <GiBeastEye />;
      if (g.includes("magicas")) return <GiUnfriendlyFire />;
      if (g.includes("instantaneas")) return <GiFocusedLightning />;
      if (g.includes("artefatos")) return <GiMagicLamp />;
      if (g.includes("equipamentos")) return <GiSkullShield />;
      if (g.includes("encantamentos")) return <GiFluffyWing />;
      if (g.includes("terrenos")) return <GiTriforce /> ;
      return <GiCrenelCrown />;
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

    if (groupBy === "none") return { "Todas as cartas": sorted };

    return sorted.reduce<Record<string, DeckCard[]>>((acc, card) => {
      let key = "Other";

      if (groupBy === "type") {
        const typeLine = card.typeLine.toLowerCase();
        if (card.isCommander) key = "Commander";
        else if (typeLine.includes("creature")) key = "Criaturas";
        else if (typeLine.includes("enchantment")) key = "Encantamentos";
        else if (typeLine.includes("sorcery")) key = "Magicas";
        else if (typeLine.includes("instant")) key = "Instantaneas";
        else if (typeLine.includes("artifact")) key = "Artefatos";
        else if (typeLine.includes("equipment")) key = "Equipamentos";
        else if (typeLine.includes("land")) key = "Terrenos";
      }

      if (groupBy === "cmc") {
        key = card.cmc >= 6 ? "CMC 6+" : `CMC ${card.cmc}`;
      }

      if (groupBy === "colors") {
        const realColors = card.colors;
        if (realColors.length === 0) key = "Incolores";
        else if (realColors.length === 1)
          key = COLOR_NAMES[realColors[0]]?.label || realColors[0];
        else key = "Multicoloridas";
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
              <option value="type">Agrupar por Tipo</option>
              <option value="cmc">Agrupar por CMC</option>
              <option value="colors">Agrupar por Cor</option>
              <option value="none">Sem Agrupamento</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="name">Ordenar por Nome</option>
              <option value="cmc">Ordenar por CMC</option>
              <option value="quantity">Ordenar por Quantidade</option>
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
                    {groupBy === "colors" ? (
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
  <div className="card-image-wrapper">
    {card.image && <img src={card.image} alt={card.name} />}
  </div>

  <div className="card-quantity">x{card.quantity}</div>

  <div className="card-info">
    
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
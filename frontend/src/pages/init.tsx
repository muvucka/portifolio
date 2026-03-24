import { useEffect, useState, useRef } from "react";
import "../pages/init.css";
import type { DiscoverResponse, ApiSetItem } from "../adapter/deckListAdapter";

export default function Init() {
  const [sets, setSets] = useState<ApiSetItem[]>([]);
  const [precons, setPrecons] = useState<ApiSetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const preconsRef = useRef<HTMLDivElement | null>(null);
  const setsRef = useRef<HTMLDivElement | null>(null);

  const [preconsPage, setPreconsPage] = useState(1);
  const [setsPage, setSetsPage] = useState(1);

  const [preconsCanScrollLeft, setPreconsCanScrollLeft] = useState(false);
  const [preconsCanScrollRight, setPreconsCanScrollRight] = useState(false);
  const [setsCanScrollLeft, setSetsCanScrollLeft] = useState(false);
  const [setsCanScrollRight, setSetsCanScrollRight] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchDiscover() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Usuário não está logado");

        const res = await fetch("http://localhost:3000/decks/discover", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar discover: ${res.status} ${res.statusText}`);
        }

        const data: DiscoverResponse = await res.json();

        if (!data || !data.precons || !data.sets) {
          throw new Error("Resposta inválida do backend");
        }

        setPrecons(data.precons);
        setSets(data.sets);

      } catch (err: unknown) {
        console.error("Erro ao buscar discover:", err);
      } finally {
        setLoading(false);
        updateScrollButtons(preconsRef, setPreconsCanScrollLeft, setPreconsCanScrollRight);
        updateScrollButtons(setsRef, setSetsCanScrollLeft, setSetsCanScrollRight);
      }
    }

    fetchDiscover();
  }, []);

  function handleScroll(
    ref: React.RefObject<HTMLDivElement | null>,
    page: number,
    setPage: (n: number) => void,
    totalItems: number
  ) {
    if (!ref.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = ref.current;

    if (scrollLeft + clientWidth >= scrollWidth - 50 && page * ITEMS_PER_PAGE < totalItems) {
      setPage(page + 1);
    }

    updateScrollButtons(
      ref,
      ref === preconsRef ? setPreconsCanScrollLeft : setSetsCanScrollLeft,
      ref === preconsRef ? setPreconsCanScrollRight : setSetsCanScrollRight
    );
  }

  function scroll(ref: React.RefObject<HTMLDivElement | null>, offset: number) {
    if (!ref.current) return;

    ref.current.scrollBy({ left: offset, behavior: "smooth" });

    updateScrollButtons(
      ref,
      ref === preconsRef ? setPreconsCanScrollLeft : setSetsCanScrollLeft,
      ref === preconsRef ? setPreconsCanScrollRight : setSetsCanScrollRight
    );
  }

  function updateScrollButtons(
    ref: React.RefObject<HTMLDivElement | null>,
    setLeft: (v: boolean) => void,
    setRight: (v: boolean) => void
  ) {
    if (!ref.current) {
      setLeft(false);
      setRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft + clientWidth < scrollWidth);
  }

  if (loading) return <div className="init-page">Carregando...</div>;

  return (
    <div className="init-page">
      <main className="content-wrapper">
        {/* Precons */}
        <section className="discover-section">
          <h2>Precons Recentes</h2>
          <div className="carousel-wrapper">
            {preconsCanScrollLeft && (
              <button className="scroll-btn left" onClick={() => scroll(preconsRef, -200)}>
                &#8249;
              </button>
            )}
            <div
              className="card-list precons-list"
              ref={preconsRef}
              onScroll={() =>
                handleScroll(preconsRef, preconsPage, setPreconsPage, precons.length)
              }
            >
              {precons.slice(0, preconsPage * ITEMS_PER_PAGE).map((precon) => (
                <div key={precon.id} className="precon-card">
                  <img src={precon.iconSvg ?? "/placeholder-card.png"} alt={precon.name} />
                  <p>{precon.name}</p>
                </div>
              ))}
            </div>
            {preconsCanScrollRight && (
              <button className="scroll-btn right" onClick={() => scroll(preconsRef, 200)}>
                &#8250;
              </button>
            )}
          </div>
        </section>

        {/* Sets */}
        <section className="discover-section">
          <h2>Sets Recentes</h2>
          <div className="carousel-wrapper">
            {setsCanScrollLeft && (
              <button className="scroll-btn left" onClick={() => scroll(setsRef, -200)}>
                &#8249;
              </button>
            )}
            <div
              className="card-list sets-list"
              ref={setsRef}
              onScroll={() => handleScroll(setsRef, setsPage, setSetsPage, sets.length)}
            >
              {sets.slice(0, setsPage * ITEMS_PER_PAGE).map((set) => (
                <div key={set.id} className="set-card">
                  <img src={set.iconSvg ?? "/placeholder-set.png"} alt={set.name} />
                  <p>{set.name}</p>
                </div>
              ))}
            </div>
            {setsCanScrollRight && (
              <button className="scroll-btn right" onClick={() => scroll(setsRef, 200)}>
                &#8250;
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { Section } from "../components/Section";
import { mapDeckListToUI } from "../adapter/deckListAdapter";
import type { Deck } from "../types/Deck";
import "../pages/Home.css";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [modalOpen, setModalOpen] = useState(false); 
  const [choiceModalOpen, setChoiceModalOpen] = useState(false); 
  const [decklistInput, setDecklistInput] = useState("");
  const [importSection, setImportSection] = useState<"meus" | "proximos" | null>(null);

  const meusRef = useRef<HTMLDivElement | null>(null);
  const proximosRef = useRef<HTMLDivElement | null>(null);

  const [meusCanLeft, setMeusCanLeft] = useState(false);
  const [meusCanRight, setMeusCanRight] = useState(false);
  const [proxCanLeft, setProxCanLeft] = useState(false);
  const [proxCanRight, setProxCanRight] = useState(false);

  
//const ITEMS_PER_PAGE = 10;

  async function fetchDecks() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não logado");

      const res = await fetch("http://localhost:3000/decks", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erro ao buscar decks: ${res.status}`);

      const data = await res.json();
      setDecks(mapDeckListToUI(data));
    } catch (err) {
      console.error("Erro ao carregar decks:", err);
    }
  }

  useEffect(() => {
    fetchDecks();
  }, []);

  function scroll(ref: React.RefObject<HTMLDivElement | null>, offset: number) {
    if (!ref.current) return;
    ref.current.scrollBy({ left: offset, behavior: "smooth" });
  }

  function updateScroll(
    ref: React.RefObject<HTMLDivElement | null>,
    setLeft: React.Dispatch<React.SetStateAction<boolean>>,
    setRight: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft + clientWidth < scrollWidth);
  }

  async function handleManualImport() {
  if (!importSection) {
    alert("Selecione se é Meus Precons ou Próximos Precons");
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Usuário não logado");
    if (!decklistInput.trim()) throw new Error("Decklist vazia");

    const lines = decklistInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let deckName = "Deck Importado";
    let cardLines = lines;

    // Verifica se a primeira linha NÃO começa com um número. 
    // Se não começar, usamos como nome do deck.
    if (!/^\d+x?\s+/i.test(lines[0])) {
      deckName = lines[0];
      cardLines = lines.slice(1);
    }

    // Filtra as cartas (agora aceitando "1 " ou "1x ")
    const validCardLines = cardLines.filter((line) => /^\d+x?\s+/i.test(line));

    if (validCardLines.length === 0) {
      alert("Nenhuma carta válida encontrada. Use o formato: '1 Nome da Carta'");
      return;
    }

    const cards = validCardLines.map((line) => {
      const match = line.match(/^(\d+)x?\s+(.+)$/i);
      if (!match) throw new Error(`Linha inválida: "${line}"`);
      return {
        quantity: parseInt(match[1], 10),
        name: match[2],
      };
    });

    const payload = { name: deckName, cards, section: importSection };

    const res = await fetch("http://localhost:3000/decks/import-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    console.log("Deck importado com sucesso!");
    setModalOpen(false);
    setDecklistInput("");
    setImportSection(null);
    fetchDecks(); // Supondo que essa função atualiza a interface
  } catch (err) {
    console.error("Erro ao importar:", err);
    alert(`Erro ao importar: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
  }
}

  const meus = decks.filter(item => item.section === "meus");
  
  const proximos = decks.filter(item => item.section === "proximos");
  
  return (
    <div className="home">
      <main className="content-wrapper">
        <div className="content-card">

          <h2>Meus Precons</h2>
          <div className="carousel-wrapper">
            <div
              className="card-list"
              ref={meusRef}
              onScroll={() => updateScroll(meusRef, setMeusCanLeft, setMeusCanRight)}
            >
              <Section itens={meus} section="meus" />
              
            </div>

            {meusCanLeft && (
              <button className="scroll-btn left" onClick={() => scroll(meusRef, -200)}>
                &#8249;
              </button>
            )}
            {meusCanRight && (
              <button className="scroll-btn right" onClick={() => scroll(meusRef, 200)}>
                &#8250;
              </button>
            )}
          </div>

          <h2 style={{ marginTop: "40px" }}>Próximos Precons</h2>
          <div className="carousel-wrapper">
            <div
              className="card-list"
              ref={proximosRef}
              onScroll={() => updateScroll(proximosRef, setProxCanLeft, setProxCanRight)}
            >
              <Section itens={proximos} section="proximos" />
            </div>

            {proxCanLeft && (
              <button className="scroll-btn left" onClick={() => scroll(proximosRef, -200)}>
                &#8249;
              </button>
            )}
            {proxCanRight && (
              <button className="scroll-btn right" onClick={() => scroll(proximosRef, 200)}>
                &#8250;
              </button>
            )}
          </div>

          <section style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button className="register-button" onClick={() => setChoiceModalOpen(true)}>
              Adicionar Precon
            </button>
          </section>

          {choiceModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Você já tem o Deck?</h2>
                <div
                  className="modal-actions"
                  style={{ justifyContent: "center", gap: "10px", marginTop: "20px" }}
                >
                  <button
                    onClick={() => {
                      setImportSection("meus");
                      setChoiceModalOpen(false);
                      setModalOpen(true);
                    }}
                  >
                    Meus Precons
                  </button>
                  <button
                    onClick={() => {
                      setImportSection("proximos");
                      setChoiceModalOpen(false);
                      setModalOpen(true);
                    }}
                  >
                    Próximos Precons
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>
                  Lista do Baralho (
                  {importSection === "meus" ? "Meus Precons" : "Próximos Precons"})
                </h2>

                <textarea
                  value={decklistInput}
                  onChange={(e) => setDecklistInput(e.target.value)}
                  placeholder={`Ex:\nDungeon of Death\n1 Sol Ring (TMC) 59\n1 Arcane Signet (TMC) 57`}
                  rows={10}
                />

                <div className="modal-actions">
                  <button onClick={handleManualImport}>Importar</button>
                  <button onClick={() => setModalOpen(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
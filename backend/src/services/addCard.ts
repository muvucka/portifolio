import prisma from '../services/prisma.js';  // Ajuste o caminho conforme necessário
import { getOrCreateCard } from '../services/card.js';  // Agora estamos importando corretamente

/**
 * Adiciona ou atualiza um card em um deck específico.
 * 
 * @param {string} deckId - O ID do deck.
 * @param {string} cardName - O nome do card a ser adicionado.
 * @returns {Promise} - Retorna uma Promise com a operação de upsert.
 */
async function addCardToDeck(deckId: string, cardName: string): Promise<any> {  // Tipando os parâmetros e o retorno
  try {
    // Cria ou obtém o card pelo nome utilizando a função importada
    const card = await getOrCreateCard(cardName);

    // Upsert na tabela de associação (deckCard)
    return await prisma.deckCard.upsert({
      where: {
        deckId_cardId: {
          deckId,
          cardId: card.id,
        }
      },
      update: {
        quantity: {
          increment: 1,  // Incrementa a quantidade do card
        }
      },
      create: {
        deckId,
        cardId: card.id,
        quantity: 1,  // Cria com a quantidade inicial de 1
      },
    });
  } catch (error) {
    console.error('Erro ao adicionar card ao deck:', error);
    throw new Error('Não foi possível adicionar o card ao deck');
  }
}

// Exportando a função `addCardToDeck` para uso em outros módulos
export { addCardToDeck };
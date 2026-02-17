const { prisma } = require('../prisma');
const { getOrCreateCard } = require('../services/card');

async function addCardToDeck(deckId: string, cardName: string) {
    const card = await getOrCreateCard(cardName);
    return prisma.deckCard.upsert({
        where: {
            deckId_cardId: {
                deckId,
                cardId: card.id,
            }
        },
        update: {
            quantity: {increment: 1}
        },
        create: {
            deckId,
            cardId: card.id,
            quantity: 1
        }
    });
    
}

module.exports = { addCardToDeck };
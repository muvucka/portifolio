const { prisma } = require('../prisma');

async function getDeckById(deckId: string) {
    return prisma.deck.findUnique({
        where: { id: deckId },
        include: {
            cards: {
                include: {
                    card: true
                }
            }
        }
    });
}

module.exports = { getDeckById };
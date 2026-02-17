const { prisma } = require('../prisma');
const { fetchCardByName } = require('../services/scryfall');
async function getOrCreateCard(name: string) { 
    const existingCard = await prisma.card.findFirst({ where: { name } });
    if (existingCard) {
        return existingCard;
    }
    const scryfallCard = await fetchCardByName(name);
    return prisma.card.create({
        data: {
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        typeLine: scryfallCard.type_line,
        cmc: scryfallCard.cmc,
        imageNormal: scryfallCard.image_uris?.normal,
        imageArtCrop: scryfallCard.image_uris?.art_crop,
        colors: scryfallCard.colors || [],
        setCode: scryfallCard.set,
        setName: scryfallCard.set_name,
        }
    });
}

module.exports = {getOrCreateCard};
import { Character, Chat } from "../../src/data/dto";
import { faker } from "@faker-js/faker";

export function getTestCharacter(character?: Partial<Character>): Character {
  return {
    userId: character?.userId ?? faker.string.uuid(),
    characterId: character?.characterId ?? faker.string.uuid(),
    name: character?.name ?? faker.person.fullName(),
    description: character?.description ?? faker.person.bio(),
    properties: character?.properties ?? {
      life_goal: `To be a ${faker.person.jobTitle()}`,
    },
    numberOfConversations:
      character?.numberOfConversations ?? faker.number.int(),
    createdAt: character?.createdAt ?? faker.date.past().toISOString(),
    updatedAt: character?.updatedAt ?? faker.date.recent().toISOString(),
  };
}

export function getTestChat(chat?: Partial<Chat>): Chat {
  return {
    userId: chat?.userId ?? faker.string.uuid(),
    chatId: chat?.chatId ?? faker.string.uuid(),
    character: chat?.character ?? getTestCharacter(),
    initialPrompt: chat?.initialPrompt ?? faker.lorem.sentence(),
    messages: chat?.messages ?? [
      {
        id: faker.string.uuid(),
        timestamp: faker.date.recent().toISOString(),
        content: faker.lorem.sentence(),
        role: "user",
      },
    ],
    createdAt: chat?.createdAt ?? faker.date.past().toISOString(),
    updatedAt: chat?.updatedAt ?? faker.date.recent().toISOString(),
  };
}

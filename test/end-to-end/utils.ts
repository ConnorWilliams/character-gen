import axios from "axios";

const API_URL = process.env.API_URL;

export async function createCharacter(jwt: string) {
  return await axios.post(
    `${API_URL}/character`,
    {
      name: "Test Character",
      description: "Test Description",
      properties: {
        life_goal: "test life goal",
      },
    },
    {
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

export async function createChat(jwt: string, characterId: string) {
  return await axios.post(
    `${API_URL}/chat`,
    {
      characterId,
    },
    {
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
}

import { ChatsController } from "../../src/controllers/chats-controller";
import { ChatService } from "../../src/services/chat-service";

describe("chat controller", () => {
  let httpController: ChatsController;

  beforeEach(() => {
    httpController = new ChatsController(new ChatService());
  });

  describe("get chats", () => {
    it("gets all chats", async () => {
      const getChatsResponse = await httpController.getChats({
        requestContext: {
          authorizer: {
            claims: {
              sub: "123",
            },
          },
        },
      } as any);
      console.log(getChatsResponse);
      expect(getChatsResponse.statusCode).toEqual(200);
      expect(JSON.parse(getChatsResponse.body)).toEqual({
        chats: "[]",
      });
    });
  });
});

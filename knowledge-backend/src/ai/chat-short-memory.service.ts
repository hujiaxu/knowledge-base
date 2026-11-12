import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";
import { BaseMessage } from "langchain";
import { AIMessage, HumanMessage, mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages } from "@langchain/core/messages";
import { isWorkingMessage } from "./chat-memory.util";

@Injectable()
export class ChatShortMemoryService {
  private readonly logger = new Logger(ChatShortMemoryService.name)
  private readonly ttlSeconds: number
  private readonly maxMessages: number
  private readonly keyPrefix: string

  constructor(
    config: ConfigService,
    private readonly redis: RedisService
  ) {
    this.ttlSeconds = Number(
      config.get('CHAT_SHORT_MEMORY_TTL_SECONDS', 86400),
    );
    this.maxMessages = Number(
      config.get('CHAT_SHORT_MEMORY_MAX_MESSAGES', 20),
    );
    this.keyPrefix = config.get('CHAT_SHORT_MEMORY_KEY_PREFIX', 'kh:chat');
  }

  get windowSize() {
    return this.maxMessages
  }

  async tryLoad(userId: string, sessionId: string): Promise<BaseMessage[] | null> {
    try {
      const raw = await this.redis.get(this.key(userId, sessionId))
      if (!raw) return null
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return null
      return mapStoredMessagesToChatMessages(parsed).filter(isWorkingMessage);
    } catch (error) {
      this.logger.warn(
        `短期记忆 Redis 读取失败，改走数据库：${error instanceof Error ? error.message : error}`,
      )
      return null
    }
  }

  async save(
    userId: string,
    sessionId: string,
    messages: BaseMessage[]
  ): Promise<void> {
    const working = messages.filter(isWorkingMessage).slice(-this.maxMessages)
    try {
      const payload = JSON.stringify(mapChatMessagesToStoredMessages(working));
      await this.redis.set(this.key(userId, sessionId), payload, this.ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `短期记忆 Redis 写入失败：${error instanceof Error ? error.message : error}`,
      )
    }
  }

  async appendTurn(
    userId: string,
    sessionId: string,
    history: BaseMessage[],
    question: string,
     answer: string
  ): Promise<void> {
    await this.save(userId, sessionId, [
      ...history,
      new HumanMessage(question),
      new AIMessage(answer)
    ])
  }

  async clear(userId: string, sessionId: string): Promise<void> {
    try {
      await this.redis.del(this.key(userId, sessionId));
    } catch (error) {
      this.logger.warn(
        `短期记忆 Redis 删除失败：${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private key(userId: string, sessionId: string) {
    return `${this.keyPrefix}:${userId}:${sessionId}:messages`;
  }
}
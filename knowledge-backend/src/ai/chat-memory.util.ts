import { AIMessage, BaseMessage, HumanMessage } from "langchain";
import { AiMessageEntity } from "./entities/ai-message.entity";

export function isWorkingMessage(message: BaseMessage): boolean {
  return HumanMessage.isInstance(message) || AIMessage.isInstance(message)
}

export function messageText(message: BaseMessage): string {
  const content = message.content
  if (typeof content === 'string') return content.trim()
  
    return content.map(part => {
      if (typeof part === 'string') return part;
      if (part && typeof part === 'object' && 'text' in part) {
        return String((part as { text?: string }).text ?? '');
      }
      return '';
    })
    .join('')
    .trim()
}

export function compactRewriteContext(history: BaseMessage[]): string {
  if (!history.length) return ''
  const lines: string[] = []
  for (const message of history.slice(-4)) {
    const text = messageText(message)
    if (!text) continue
    if (HumanMessage.isInstance(message)) {
      lines.push(`用户：${text.slice(0, 200)}`);
    } else if (AIMessage.isInstance(message)) {
      lines.push(`助手：${text.slice(0, 120)}`);
    }
  }

  return lines.join('\n')
}

export function dbRowsToMessages(rows: AiMessageEntity[]): BaseMessage[] {
  const out: BaseMessage[] =[]
  for (const row of rows) {
    const text = row.content?.trim()
    if (!text) continue
    if (row.role === 'user') out.push(new HumanMessage(text))
    if (row.role === 'assistant') out.push(new AIMessage(text))
  }
  return out
}
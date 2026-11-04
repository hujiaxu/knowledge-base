import { Injectable, Logger } from "@nestjs/common";
import { RabbitMqService } from "./rabbitmq.service";
import { KG_GRAPH_QUEUE, RAG_REINDEX_QUEUE, SEARCH_INDEX_QUEUE } from "./mq.constants";
import { ConsumeMessage } from "amqplib";
import { KgBuildMessage, ReindexMessage, SearchIndexMessage } from "./messages/pipeline.messages";
import { PipelineOrchestrator } from "../pipeline/pipeline.orchestrator";

@Injectable()
export class DocumentPipelineConsumer {
  private readonly logger = new Logger(DocumentPipelineConsumer.name);


  constructor(
    private readonly rabbit: RabbitMqService,
    private readonly orchestrator: PipelineOrchestrator,
  ) {
    this.rabbit.registerHandler(RAG_REINDEX_QUEUE, (msg) =>
      this.handleRag(msg),
    );
    this.rabbit.registerHandler(SEARCH_INDEX_QUEUE, (msg) =>
      this.handleSearch(msg),
    );
    this.rabbit.registerHandler(KG_GRAPH_QUEUE, (msg) => this.handleKg(msg));
  }
  /** RAG：分块 → 向量化 → ES kh_chunk（dense_vector） */
  private async handleRag(msg: ConsumeMessage) {
    const body = this.parseJson<ReindexMessage>(msg);
    this.logger.log(
      `[RAG] type=${body.type}, taskId=${body.taskId}, documentIds=${JSON.stringify(body.documentIds ?? [])}`,
    );
    await this.orchestrator.handleRagReindex(body.type, body.documentIds);
  }

  /** Search：文档级关键词索引（Elasticsearch kh_document） */
  private async handleSearch(msg: ConsumeMessage) {
    const body = this.parseJson<SearchIndexMessage>(msg);
    this.logger.log(
      `[Search] type=${body.type}, taskId=${body.taskId}, documentId=${body.documentId}`,
    );


    await this.orchestrator.handleSearchIndex(
      body.type,
      body.documentId
    );
  }
  /** KG：分块 → 抽实体关系 → Neo4j */
  private async handleKg(msg: ConsumeMessage) {
    const body = this.parseJson<KgBuildMessage>(msg);
    this.logger.log(
      `[KG] type=${body.type}, taskId=${body.taskId}, documentIds=${JSON.stringify(body.documentIds ?? [])}`,
    );
    await this.orchestrator.handleKgBuild(body.type, body.documentIds);
  }
  
  private parseJson<T>(msg: ConsumeMessage): T {
    return JSON.parse(msg.content.toString('utf8')) as T;
  }

}
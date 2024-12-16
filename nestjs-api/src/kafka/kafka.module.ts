import { Inject, Module, OnModuleInit } from '@nestjs/common';
import * as KafkaLib from '@confluentinc/kafka-javascript';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'KAFKA_PRODUCER',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new KafkaLib.KafkaJS.Kafka({
          'bootstrap.servers': configService.get('KAFKA_BROKER'),
        }).producer();
      },
    },
  ],
  exports: ['KAFKA_PRODUCER'],
})
export class KafkaModule implements OnModuleInit {
  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: KafkaLib.KafkaJS.Producer,
  ) {}

  async onModuleInit() {
    await this.kafkaProducer.connect();
  }
}

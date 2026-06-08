import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { Room } from './models/room.model';
import { Story } from './models/story.model';
import { Task } from './models/task.model';
import { Participant } from './models/participant.model';
import { ChatMessage } from './models/chat-message.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Room, Story, Task, Participant, ChatMessage]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}

import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamEntity } from './entities/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TeamMemberEntity } from './entities/team-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, TeamMemberEntity, UserEntity]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}

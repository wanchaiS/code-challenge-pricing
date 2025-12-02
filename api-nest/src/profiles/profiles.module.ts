import { Module } from '@nestjs/common';
import { ProfilesController } from './controllers/profiles.controller';
import { ProfilesService } from './services/profiles.service';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfileRepository],
})
export class ProfilesModule {}

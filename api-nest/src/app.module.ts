import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, ProductsModule, ProfilesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

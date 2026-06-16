import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RoomsModule } from "./rooms/rooms.module";

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: "sqlite",
			storage: "./database.sqlite",
			autoLoadModels: true,
			synchronize: true,
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "..", "frontend", "dist"),
			exclude: ["/api", "/api/{*path}"],
		}),
		RoomsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

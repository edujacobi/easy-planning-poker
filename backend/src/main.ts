import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { RateLimiterGuard } from "./rooms/guards/rate-limiter.guard";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	app.useGlobalGuards(new RateLimiterGuard());
	app.enableCors();
	await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

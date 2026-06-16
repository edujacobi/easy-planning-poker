import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { RateLimiterGuard } from "./rooms/guards/rate-limiter.guard";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true }),
	);
	app.useGlobalGuards(new RateLimiterGuard());
	app.enableCors();
	const port = process.env.PORT ?? 3000;
	await app.listen(port, "0.0.0.0");
	console.log(`Server successfully started on http://0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
	console.error("Application failed to start:", error);
	process.exit(1);
});

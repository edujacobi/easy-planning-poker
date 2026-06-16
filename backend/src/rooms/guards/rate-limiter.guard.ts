import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class RateLimiterGuard implements CanActivate {
	private requests = new Map<string, { count: number; resetTime: number }>();

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const ip = request.ip || request.headers["x-forwarded-for"] || "unknown";
		const now = Date.now();
		const windowMs = 60 * 1000; // 1 minute window
		const maxRequests = 100; // limit to 100 requests per minute

		let record = this.requests.get(ip);
		if (!record || now > record.resetTime) {
			record = { count: 0, resetTime: now + windowMs };
		}

		record.count++;
		this.requests.set(ip, record);

		if (record.count > maxRequests) {
			throw new HttpException(
				{
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					message: "Too many requests, please try again later.",
					error: "Too Many Requests",
				},
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		return true;
	}
}

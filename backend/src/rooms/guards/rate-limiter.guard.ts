import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Injectable()
export class RoomCreationRateLimiterGuard implements CanActivate {
	private requests = new Map<string, { count: number; resetTime: number }>();

	canActivate(context: ExecutionContext): boolean {
		const http = context.switchToHttp();
		const request = http.getRequest<Request>();
		const response = http.getResponse<Response>();
		const now = Date.now();
		const windowMs = 60 * 60 * 1000;

		// ponytail: sweep active IPs per creation; use a shared TTL store for multiple instances.
		for (const [ip, record] of this.requests) {
			if (record.resetTime <= now) this.requests.delete(ip);
		}

		const ip = request.ip || request.socket.remoteAddress || "unknown";
		const record = this.requests.get(ip) ?? {
			count: 0,
			resetTime: now + windowMs,
		};

		if (record.count >= 10) {
			response.setHeader(
				"Retry-After",
				Math.ceil((record.resetTime - now) / 1000),
			);
			throw new HttpException(
				"Too many rooms created. Please try again later.",
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		record.count++;
		this.requests.set(ip, record);
		return true;
	}
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
	private requests = new Map<string, { count: number; resetTime: number }>();

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const ip =
			request.ip || request.headers["x-forwarded-for"] || "unknown";
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

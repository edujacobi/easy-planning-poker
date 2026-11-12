import {
	IsString,
	IsNotEmpty,
	IsEnum,
	IsUUID,
	IsArray,
	ValidateNested,
	MinLength,
	MaxLength,
	IsOptional,
} from "class-validator";
import { plainToInstance, Transform, Type } from "class-transformer";

class TaskDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@IsOptional()
	@IsString()
	description?: string;
}

class StoryDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@IsArray()
	@Transform(({ value }: { value: unknown }) =>
		Array.isArray(value)
			? value.map((task: unknown) =>
					typeof task === "string"
						? plainToInstance(TaskDto, { title: task })
						: task,
				)
			: value,
	)
	@ValidateNested({ each: true })
	@Type(() => TaskDto)
	tasks: TaskDto[];
}

export class CreateRoomDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(255)
	title: string;

	@IsEnum(["linear", "fibonacci"])
	voteType: "linear" | "fibonacci";

	@IsUUID()
	creatorUserId: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	creatorNickname: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	creatorEmoji: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => StoryDto)
	stories: StoryDto[];
}

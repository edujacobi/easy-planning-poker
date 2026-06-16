import { IsString, IsNotEmpty, IsEnum, IsUUID, IsArray, ValidateNested, MinLength, MaxLength } from "class-validator";
import { Type } from "class-transformer";

class StoryDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	title: string;

	@IsArray()
	@IsString({ each: true })
	tasks: string[];
}

export class CreateRoomDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(100)
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

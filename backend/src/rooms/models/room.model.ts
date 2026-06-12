import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Story } from "./story.model";
import { Participant } from "./participant.model";
import { ChatMessage } from "./chat-message.model";

@Table({ tableName: "rooms", timestamps: true })
export class Room extends Model<Room> {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare title: string;

	@Column({
		type: DataType.ENUM("linear", "fibonacci"),
		allowNull: false,
	})
	declare voteType: "linear" | "fibonacci";

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare adminUserId: string;

	@HasMany(() => Story, { onDelete: "CASCADE" })
	declare stories: Story[];

	@HasMany(() => Participant, { onDelete: "CASCADE" })
	declare participants: Participant[];

	@HasMany(() => ChatMessage, { onDelete: "CASCADE" })
	declare chatMessages: ChatMessage[];
}

import {
	Table,
	Column,
	Model,
	DataType,
	ForeignKey,
	BelongsTo,
} from "sequelize-typescript";
import { Room } from "./room.model";

@Table({ tableName: "participants", timestamps: true })
export class Participant extends Model<Participant> {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@ForeignKey(() => Room)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	declare roomId: string;

	@BelongsTo(() => Room)
	declare room: Room;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare userId: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare nickname: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare emoji: string;
}

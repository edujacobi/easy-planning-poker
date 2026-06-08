import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Room } from './room.model';
import { Task } from './task.model';

@Table({ tableName: 'stories', timestamps: true })
export class Story extends Model<Story> {
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
  declare title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare order: number;

  @HasMany(() => Task, { onDelete: 'CASCADE' })
  declare tasks: Task[];
}

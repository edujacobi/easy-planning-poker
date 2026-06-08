import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Story } from './story.model';

@Table({ tableName: 'tasks', timestamps: true })
export class Task extends Model<Task> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Story)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare storyId: string;

  @BelongsTo(() => Story)
  declare story: Story;

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

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare points: number | null;
}

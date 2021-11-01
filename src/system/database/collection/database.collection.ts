import {
  Column,
  ConnectionOptions,
  Entity,
  ObjectID,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IConnection } from '../interface/connection.interface';

@Entity({
  name: 'ArtgenDatabases',
})
export class DatabaseEntity implements IConnection {
  @PrimaryGeneratedColumn('uuid')
  @ObjectIdColumn()
  id: ObjectID;

  @Column({
    type: 'text',
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
  })
  url: string;

  @Column({
    type: 'text',
  })
  type: ConnectionOptions['type'];

  @Column({
    type: 'json',
    default: ['active'],
    nullable: false,
  })
  tags: string[];
}

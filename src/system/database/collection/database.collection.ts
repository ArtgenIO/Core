import {
  Column,
  ConnectionOptions,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'ArtgenDatabases',
})
export class DatabaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  reference: string;

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

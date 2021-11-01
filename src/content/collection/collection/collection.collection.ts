import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';

@Entity({
  name: 'ArtgenCollections',
})
@Unique(['database', 'reference'])
export class CollectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  database: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  reference: string;

  @Column({
    type: 'json',
    nullable: false,
  })
  metadata: {
    label: string;
  };

  @Column({
    type: 'json',
    nullable: false,
  })
  descriptor: EntitySchemaOptions<object>;

  @Column({
    type: 'json',
    nullable: false,
    default: ['active'],
  })
  tags: string[];
}

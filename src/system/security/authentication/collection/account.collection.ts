import {
  Column,
  Entity,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordHashTransformer } from '../../../../management/transformer/password-hash.transformer';

@Entity({
  name: 'ArtgenAccounts',
})
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  @ObjectIdColumn({
    name: 'id',
  })
  readonly id: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: false,
    transformer: new PasswordHashTransformer(),
  })
  password: string;
}

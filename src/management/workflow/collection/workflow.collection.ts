import {
  Column,
  Entity,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { INode, IWorkflow } from '../interface';
import { IEdge } from '../interface/edge.interface';

@Entity({
  name: 'ArtgenWorkflows',
})
export class WorkflowEntity implements IWorkflow {
  @PrimaryGeneratedColumn('uuid')
  @ObjectIdColumn()
  readonly id: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'json',
    default: [],
    nullable: false,
  })
  nodes: INode[];

  @Column({
    type: 'json',
    default: [],
    nullable: false,
  })
  edges: IEdge[];
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ISerializedEdge } from '../interface/serialized-edge.interface';
import { ISerializedNode } from '../interface/serialized-node.interface';
import { IWorkflow } from '../interface/serialized-workflow.interface';

@Entity({
  name: 'ArtgenWorkflows',
})
export class WorkflowEntity implements IWorkflow {
  @PrimaryGeneratedColumn('uuid')
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
  nodes: ISerializedNode[];

  @Column({
    type: 'json',
    default: [],
    nullable: false,
  })
  edges: ISerializedEdge[];
}

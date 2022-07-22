import { RepeatOptions } from 'bullmq';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class RepeatableJob {
  @PrimaryColumn()
  name: string;

  @Column({
    nullable: true,
  })
  jobId: string;

  @Column({
    type: 'json',
  })
  options: RepeatOptions;
}

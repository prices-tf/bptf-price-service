import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
@Index(['updatedAt'])
@Index(['createdAt'])
export class Price {
  @PrimaryColumn()
  sku: string;

  @Column({
    type: 'int',
  })
  buyHalfScrap: number;

  @Column({
    type: 'int',
  })
  buyKeys: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  buyKeyHalfScrap: number;

  @Column({
    type: 'int',
  })
  sellHalfScrap: number;

  @Column({
    type: 'int',
  })
  sellKeys: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  sellKeyHalfScrap: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

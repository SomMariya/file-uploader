import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ nullable: true })
  driveUrl: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;
}

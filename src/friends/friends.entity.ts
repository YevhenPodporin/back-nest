import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { User } from '../user/user.entity';

export enum RequestStatus {
	REQUEST = 'REQUEST',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED'
}

@Entity('friends')
@Index(['from_user', 'to_user'], { unique: true })
export class Friends {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'enum', enum: RequestStatus })
	status: RequestStatus;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@ManyToOne(() => User, user => user.fromFriends, { onDelete: 'CASCADE' })
	from_user: User;

	@ManyToOne(() => User, user => user.toFriends, { onDelete: 'CASCADE' })
	to_user: User;
}

import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { User } from '../user/user.entity';
import { Chats } from '../chats/chats.entity';

@Entity('notifications')
export class Notifications {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Chats, chats => chats.id, { onDelete: 'CASCADE' })
	chat: Chats;

	@ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
	to_user: User;

	@Column()
	unread_messages: number;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

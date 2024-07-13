import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';
import { Chats } from '../chats/chats.entity';
import { User } from '../user/user.entity';

@Entity('messages')
export class Messages {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Chats, chat => chat.messages, { onDelete: 'CASCADE' })
	chat: Chats;

	@ManyToOne(() => User, user => user.id, {
		onDelete: 'CASCADE'
	})
	sender: User;

	@Column()
	message: string;

	@Column({ nullable: true })
	file: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn({ nullable: true })
	updated_at: Date;
}

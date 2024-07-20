import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';
import { Messages } from '../messages/messages.entity';
import { User } from '../user/user.entity';
import { Notifications } from '../notifications/notifications.entity';

@Entity('chats')
export class Chats {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToMany(() => Messages, message => message.chat)
	messages: Messages[];

	@ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
	from_user: User;

	@ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
	to_user: User;

	@OneToMany(() => Notifications, notification => notification.chat, {
		onDelete: 'CASCADE'
	})
	notifications: Notifications[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Friends } from '../friends/friends.entity';

@Entity('user')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	email: string;

	@Column({ select: false })
	password: string;

	@Column({ default: null })
	google_id: string;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@OneToOne(() => Profile, profile => profile.user, {
		cascade: ['insert', 'update']
	})
	profile: Profile;

	@OneToMany(() => Friends, friends => friends.from_user, {
		cascade: ['insert', 'update']
	})
	fromFriends: Friends[];

	@OneToMany(() => Friends, friends => friends.to_user, {
		cascade: ['insert', 'update']
	})
	toFriends: Friends[];

	// @OneToMany(() => Chats, chat => chat.from_user, { cascade: ['insert', 'update'] })
	// chatFromUser: Chats[];
	//
	// @OneToMany(() => Chats, chat => chat.to_user, { cascade: ['insert', 'update'] })
	// chatToUser: Chats[];
}

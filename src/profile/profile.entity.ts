import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('profile')
export class Profile extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	first_name: string;

	@Column()
	last_name: string;

	@Column()
	date_of_birth: string;

	@Column({ nullable: true })
	file_path: string;

	@Column('bool')
	is_online: boolean;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@OneToOne(() => User, user => user.profile, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	user: User;
}

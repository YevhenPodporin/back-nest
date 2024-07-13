import { User } from './user.entity';
import { Profile } from '../profile/profile.entity';
import { Tokens } from '../auth/types';

export interface UserWithProfileResponse extends Tokens {
	user: {
		id: User['id'];
		user_id: User['id'];
		email: User['email'];
		first_name: Profile['first_name'];
		last_name: Profile['last_name'];
		date_of_birth: Profile['date_of_birth'];
		file_path: Profile['file_path'];
		is_online: Profile['is_online'];
		created_at: Profile['created_at'];
		updated_at: Profile['updated_at'];
	};
}

import {
	IsString,
	IsOptional,
	IsEnum,
	IsNotEmpty,
	ValidateNested,
	IsNumberString
} from 'class-validator';
import { RequestStatus } from '../friends.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Определите перечисления Direction и OrderBy в соответствии с вашим кодом
enum Direction {
	ASC = 'asc',
	DESC = 'desc'
}

enum OrderBy {
	created_at = 'created_at'
}

class FilterDto {
	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	@IsEnum(RequestStatus)
	status: string;

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	search: string;
}

class PaginationDto {
	@ApiProperty({ default: 10 })
	@IsNumberString()
	take: number;

	@ApiProperty({ default: 0 })
	@IsNumberString()
	skip: number;

	@ApiProperty({ default: Direction.ASC })
	@IsEnum(Direction)
	direction: Direction;

	@ApiProperty({ default: OrderBy.created_at })
	@IsEnum(OrderBy)
	order_by: OrderBy;
}

export class GetUsersDto {
	@ApiProperty({ required: false })
	@ValidateNested()
	@Type(() => FilterDto)
	@IsOptional()
	filter: FilterDto;

	@ApiProperty()
	@ValidateNested()
	@Type(() => PaginationDto)
	@IsNotEmpty()
	pagination: PaginationDto;
}

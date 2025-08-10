import { PartialType } from '@nestjs/swagger';
import { CreatePurohitDto } from './create-purohit.dto';

export class UpdatePurohitDto extends PartialType(CreatePurohitDto) {}



import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';

export class SignUpUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: 'Password must contain at least one letter, one number, and one special character'
    })
    password: string;

    @IsOptional()
    @IsString({ message: 'Confirmation pin must be a string' })
    @Matches(/^\d{4,5}$/, { message: 'Confirmation pin must be 4-5 digits' })
    confirmationPin: string;

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @Matches(/^[A-Za-z\s]+$/, { message: 'Name can only contain letters and spaces' })
    name: string;

    @IsString({ message: 'ID number must be a string' })
    @IsNotEmpty({ message: 'ID number is required' })
    @Matches(/^[A-Za-z0-9\/-]{6,15}$/, { message: 'ID number must be 6-15 characters and can contain letters, numbers, / and -' })
    idNumber: string;

    @IsString({ message: 'ID document type must be a string' })
    @IsNotEmpty({ message: 'ID document type is required' })
    IDDocType: string;

    @IsString({ message: 'Type must be a string' })
    @IsNotEmpty({ message: 'Type is required' })
    type: string;

    @IsOptional()
    file: Express.Multer.File;
}

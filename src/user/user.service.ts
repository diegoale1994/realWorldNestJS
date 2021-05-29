import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserEntity } from './user.entity';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUserDto';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {

    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({ email: createUserDto.email });
        const userByUsername = await this.userRepository.findOne({ username: createUserDto.username });

        if (userByUsername || userByEmail) {
            throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }

    generateJwt(user: UserEntity) {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, JWT_SECRET)
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne(
            { email: loginUserDto.email }, { select: ['id', 'username', 'email', 'bio', 'image', 'password'] }
        );

        if (!user) {
            throw new HttpException('credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const isPasswordCorrect = await compare(loginUserDto.password, user.password);

        if (!isPasswordCorrect) {
            throw new HttpException('credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        delete user.password;
        return user;
    }

    async findById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne(id);
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.findById(userId);
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }
}

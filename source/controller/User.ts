import { createHash } from 'crypto';
import { JsonWebTokenError, sign } from 'jsonwebtoken';
import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    HttpCode,
    HttpError,
    JsonController,
    OnNull,
    OnUndefined,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    JWTAction,
    Role,
    SignInData,
    User,
    UserFilter,
    UserListChunk
} from '../model';
import { APP_SECRET, searchConditionOf, supabase } from '../utility';
import { ActivityLogController } from './ActivityLog';

const store = dataSource.getRepository(User);

@JsonController('/user')
export class UserController {
    static encrypt = (raw: string) =>
        createHash('sha1')
            .update(APP_SECRET + raw)
            .digest('hex');

    static sign = (user: User): User => ({
        ...user,
        token: sign({ ...user }, APP_SECRET)
    });

    static async signUp({ email, password }: SignInData) {
        const sum = await store.count();

        const { password: _, ...user } = await store.save({
            name: email,
            email,
            password: UserController.encrypt(password),
            roles: [sum ? Role.Client : Role.Administrator]
        });
        await ActivityLogController.logCreate(user, 'User', user.id);

        return user;
    }

    static getSession = ({ context: { state } }: JWTAction) =>
        'user' in state
            ? state.user
            : (console.error(state.jwtOriginalError), null);

    @Post('/session/email/:email/OTP')
    @OnUndefined(204)
    async sendEmailOTP(@Param('email') email: string) {
        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) throw new HttpError(error.status, error.message);
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(User)
    getSession(@CurrentUser() user: User) {
        return user;
    }

    @Post('/session')
    @HttpCode(201)
    @ResponseSchema(User)
    async signIn(@Body() { email, password }: SignInData): Promise<User> {
        let user = await store.findOneBy({
            email,
            password: UserController.encrypt(password)
        });

        if (!user) {
            const { error, data } = await supabase.auth.verifyOtp({
                type: 'email',
                email,
                token: password
            });
            if (error) throw new HttpError(error.status, error.message);

            user =
                (await store.findOneBy({ email })) ||
                (await this.signUp({ email, password: data.user.id }));
        }
        return UserController.sign(user);
    }

    @Post()
    @HttpCode(201)
    @ResponseSchema(User)
    signUp(@Body() data: SignInData) {
        return UserController.signUp(data);
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(User)
    async updateOne(
        @Param('id') id: number,
        @CurrentUser() updatedBy: User,
        @Body() { password, ...data }: User
    ) {
        if (
            !updatedBy.roles.includes(Role.Administrator) &&
            id !== updatedBy.id
        )
            throw new ForbiddenError();

        const saved = await store.save({
            ...data,
            password: password && UserController.encrypt(password),
            id
        });
        await ActivityLogController.logUpdate(updatedBy, 'User', id);

        return UserController.sign(saved);
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(User)
    getOne(@Param('id') id: number) {
        return store.findOne({ where: { id } });
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@Param('id') id: number, @CurrentUser() deletedBy: User) {
        if (deletedBy.roles.includes(Role.Administrator) && id == deletedBy.id)
            throw new ForbiddenError();

        await store.softDelete(id);

        await ActivityLogController.logDelete(deletedBy, 'User', id);
    }

    @Get()
    @ResponseSchema(UserListChunk)
    async getList(
        @QueryParams() { gender, keywords, pageSize, pageIndex }: UserFilter
    ) {
        const where = searchConditionOf<User>(
            ['email', 'mobilePhone', 'name'],
            keywords,
            gender && { gender }
        );
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}

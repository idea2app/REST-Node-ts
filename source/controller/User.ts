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

import { Role, SignInData, User, UserFilter, UserListChunk } from '../model';
import { activityLogService, BaseService, sessionService } from '../service';
import { searchConditionOf, supabase } from '../utility';

@JsonController('/user')
export class UserController {
    store = sessionService.userStore;
    service = new BaseService(User, ['email', 'mobilePhone', 'name']);

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
        let user = await this.store.findOneBy({
            email,
            password: sessionService.encrypt(password)
        });

        if (!user) {
            const { error, data } = await supabase.auth.verifyOtp({
                type: 'email',
                email,
                token: password
            });
            if (error) throw new HttpError(error.status, error.message);

            user =
                (await this.store.findOneBy({ email })) ||
                (await this.signUp({ email, password: data.user.id }));
        }
        return sessionService.sign(user);
    }

    @Post()
    @HttpCode(201)
    @ResponseSchema(User)
    signUp(@Body() data: SignInData) {
        return sessionService.signUp(data);
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(User)
    async updateOne(
        @Param('id') id: number,
        @CurrentUser() updatedBy: User,
        @Body() { password, ...data }: User
    ) {
        if (!updatedBy.roles.includes(Role.Administrator) && id !== updatedBy.id)
            throw new ForbiddenError();

        const saved = await this.store.save({
            ...data,
            password: password && sessionService.encrypt(password),
            id
        });
        await activityLogService.logUpdate(updatedBy, 'User', id);

        return sessionService.sign(saved);
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(User)
    getOne(@Param('id') id: number) {
        return this.service.getOne(id);
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@Param('id') id: number, @CurrentUser() deletedBy: User) {
        if (deletedBy.roles.includes(Role.Administrator) && id == deletedBy.id)
            throw new ForbiddenError();

        await this.store.softDelete(id);

        await activityLogService.logDelete(deletedBy, 'User', id);
    }

    @Get()
    @ResponseSchema(UserListChunk)
    getList(@QueryParams() { gender, keywords, ...filter }: UserFilter) {
        const where = searchConditionOf<User>(
            ['email', 'mobilePhone', 'name'],
            keywords,
            gender && { gender }
        );
        return this.service.getList({ keywords, ...filter }, where);
    }
}

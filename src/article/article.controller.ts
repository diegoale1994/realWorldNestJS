import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/user/decorators/user.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticleDto';

@Controller('articles')
export class ArticleController {

    constructor(private readonly articleService: ArticleService) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto
    ) {
        return await this.articleService.createArticle(currentUser, createArticleDto);
    }
}

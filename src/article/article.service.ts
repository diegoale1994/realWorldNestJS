import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticleDto';

@Injectable()
export class ArticleService {

    constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) { }

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);
        if (!article.tagList) {
            article.tagList = [];
        }
        article.author = currentUser;
        article.slug = "foo";
        return await this.articleRepository.save(article);

    }
}
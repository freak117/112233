import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  searchUsers(@Query('username') username: string): Promise<unknown> {
    return this.searchService.searchUsers(username ?? '');
  }
}


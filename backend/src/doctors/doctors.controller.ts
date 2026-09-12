import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { SearchDoctorsDto } from './dto/search-doctors.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(@Query() query: SearchDoctorsDto) {
    return this.doctorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }
}

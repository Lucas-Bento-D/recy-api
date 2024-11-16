import { Injectable } from '@nestjs/common';

import { ResultDto, SupportDto } from './dtos';

@Injectable()
export class FootprintService {
  saveContactInfo(infos: SupportDto) {
    // TODO: save informations on database
    console.log(infos);
  }

  saveResultInfo(info: ResultDto) {
    // TODO: save informations on database
    console.log(info);
  }
}

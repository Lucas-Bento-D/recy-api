import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Web3 from 'web3';

import { Web3Service } from './web3.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CeloWeb3',
      useFactory: (configService: ConfigService) => {
        return new Web3(configService.get('CELO_RPC_URL')); // Use Celo RPC URL from config
      },
      inject: [ConfigService],
    },
    {
      provide: 'PolygonWeb3',
      useFactory: (configService: ConfigService) => {
        return new Web3(configService.get('POLYGON_RPC_URL')); // Use Polygon RPC URL from config
      },
      inject: [ConfigService],
    },
    {
      provide: 'Config',
      useFactory: (configService: ConfigService) => {
        return {
          wallet: configService.get('WALLET'),
          privateKey: configService.get('PRIVATE_KEY'),
        };
      },
      inject: [ConfigService],
    },
    Web3Service,
  ],
  exports: [Web3Service],
})
export class Web3Module {}

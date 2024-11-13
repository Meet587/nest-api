import { DataSource, DataSourceOptions } from 'typeorm';
import * as env from '../config/environment.config';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { dbConfig } from 'src/config/interface/db.config';

const DbConfig = env.getConfig().dbConfig as dbConfig;

const dataSourceOption: DataSourceOptions = {
  type: 'mysql',
  host: DbConfig.host,
  username: DbConfig.username,
  password: DbConfig.password,
  database: DbConfig.dbName,
  synchronize: true,
  logging: true,
  entities: [
    AuthModule,
    UserModule,
  ],
};

export default new DataSource(dataSourceOption);

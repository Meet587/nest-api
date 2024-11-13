import { plainToClass } from 'class-transformer';
import { Env } from './env';
import { validateSync } from 'class-validator';
import { registerAs } from '@nestjs/config';
import { localEnv } from './sets/local.config';
import { commonConfig } from './interface/common.config';
import { validationErrorsToArray } from 'src/helper/utils';

export const envMap = new Map<Env, () => commonConfig>([[Env.LOCAL, localEnv]]);

export const getConfig = (): commonConfig => {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() as Env;
  const getEnvironment = envMap.get(nodeEnv);
  if (!getEnvironment) {
    throw new Error(`Configuration for NODE_ENV=${nodeEnv} not found.`);
  }
  const conf = plainToClass(commonConfig, getEnvironment());
  const errors = validateSync(conf, {
    whitelist: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
    groups: [nodeEnv],
  });
  if (errors.length) {
    throw new Error(validationErrorsToArray(errors).toString());
  }

  return conf;
};

export default registerAs('environment', getConfig);

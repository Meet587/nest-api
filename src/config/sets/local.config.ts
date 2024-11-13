import { commonConfig } from '../interface/common.config';

export const localEnv = (): commonConfig => ({
  authConfig: {
    jwtSecrete:
      '76e6IiV2qjjAd4f6qpJYvg4LW7wqk8qVdwd5IjrTHglnVPClByqUbRQ0Ah+D+e4C5xtE6hhdS8jo3mkeuZQ1Ig==',
    tokenExp: '30m',
    refreshTokenExp: '2d',
  },

  dbConfig: {
    host: 'localhost',
    dbName: 'nestjs_db',
    password: '',
    username: 'root',
    port: 3306,
  },

  serviceConfig: {
    webHostUrl: 'http://localhost:3003',
    port: 3003,
  },
});

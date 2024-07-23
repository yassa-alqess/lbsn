import dotenv from 'dotenv';
import fs from 'fs';

/**
 *   docker-compose will spin up the correct .env file (that is recommended),
 *   but in case u don't use it, u can set postgres configrations urself on ur local machine,
 *   and u can depend on the NODE_ENV variable u pass to node daemon, to set the correct .env file.
 */

const _env = process.env.NODE_ENV || 'dev';
const _path = __dirname + `/../../../.env.${_env}`;

//check that env file exists
try {
  if (fs.existsSync(_path)) {
    dotenv.config({
      path: _path,
    });
  }
} catch (err) {
  console.error('Error loading proper .env file'); // can't use logger here, as it's not properly configured yet.
  process.exit(1);
}

export const ENV = _env;
export const PORT = process.env.PORT || 8000;

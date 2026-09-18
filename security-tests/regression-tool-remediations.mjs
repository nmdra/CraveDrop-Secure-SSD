#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const nginx = read('api-gateway/nginx.conf');
expect(nginx.includes('server_tokens off;'), 'Gateway still exposes the Nginx version token');
expect(
  nginx.includes("Content-Security-Policy \"default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'\" always;"),
  'Gateway fallback responses lack the required Content-Security-Policy',
);

for (const service of ['delivery-service', 'order-service']) {
  const lock = json(`${service}/package-lock.json`).packages;
  expect(lock['node_modules/axios']?.version === '1.20.0', `${service} does not lock Axios 1.20.0`);
  expect(lock['node_modules/form-data']?.version === '4.0.6', `${service} does not lock form-data 4.0.6`);
  expect(lock['node_modules/mongoose']?.version === '8.24.4', `${service} does not lock Mongoose 8.24.4`);
}

const driverLock = json('driver-service/package-lock.json').packages;
expect(driverLock['node_modules/mongoose']?.version === '8.24.4', 'driver-service does not lock Mongoose 8.24.4');
expect(driverLock['node_modules/bcrypt']?.version === '6.0.0', 'driver-service does not lock bcrypt 6.0.0');
expect(!driverLock['node_modules/tar'], 'driver-service retains the vulnerable bcrypt tar dependency');

const userPackage = json('user-service/package.json');
expect(userPackage.dependencies.bcrypt === '6.0.0', 'user-service does not declare bcrypt 6.0.0');
const userYarnLock = read('user-service/yarn.lock');
expect(userYarnLock.includes('bcrypt@6.0.0:\n  version "6.0.0"'), 'user-service does not resolve bcrypt 6.0.0');
expect(!userYarnLock.includes('tar@^6.1.11:'), 'user-service retains the vulnerable bcrypt tar dependency');

const restaurantNpmLock = json('restaurant-service/package-lock.json').packages;
expect(restaurantNpmLock['node_modules/mongoose']?.version === '8.24.4', 'restaurant-service npm lock does not contain Mongoose 8.24.4');
const restaurantYarnLock = read('restaurant-service/yarn.lock');
expect(restaurantYarnLock.includes('mongoose@^8.24.4:\n  version "8.24.4"'), 'restaurant-service Yarn lock does not contain Mongoose 8.24.4');

const smsYarnLock = read('sms-service/yarn.lock');
expect(smsYarnLock.includes('form-data@^4.0.6:\n  version "4.0.6"'), 'sms-service does not resolve form-data 4.0.6');
expect(!smsYarnLock.includes('form-data@^4.0.0:\n  version "4.0.2"'), 'sms-service retains the vulnerable form-data resolution');

const frontendPackage = json('frontend/package.json');
expect(frontendPackage.dependencies.axios === '1.20.0', 'frontend does not declare Axios 1.20.0');
expect(frontendPackage.dependencies['react-router'] === '7.18.2', 'frontend does not declare react-router 7.18.2');
expect(frontendPackage.dependencies['react-router-dom'] === '7.18.2', 'frontend does not declare react-router-dom 7.18.2');

const frontendLock = read('frontend/yarn.lock');
expect(frontendLock.includes('form-data@^4.0.6:\n  version "4.0.6"'), 'frontend does not resolve form-data 4.0.6');
expect(frontendLock.includes('react-router@7.18.2:'), 'frontend does not resolve react-router 7.18.2');
expect(frontendLock.includes('react-router-dom@7.18.2:'), 'frontend does not resolve react-router-dom 7.18.2');

console.log('Scanner-remediation source regression checks passed on the current source.');

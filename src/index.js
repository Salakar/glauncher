import { exec } from 'child_process';
import Promise from 'bluebird';
import { pull } from 'simple-git';
import { hostname } from 'os';
import NpmInstall from 'npmi';

if (!process.env.GLAUNCHER) {
  // grab users project config
  const packageJSON = (function () {
    const mainPath = process.cwd();
    try {
      return require(mainPath + '/package.json');
    } catch (e) {
      return null;
    }
  })();

  const name = packageJSON ? packageJSON.name || 'UNKNOWN' : 'UNKNOWN';
  const env = process.env.NODE_ENV || process.env.ENV || 'development';

  // default configuration options
  let config = {
    name,
    gitPull: true,
    gitRemote: "origin",
    gitBranch: 'master',
    npmInstall: true,
    npmInstallOptions: {
      localInstall: true,
      name: process.cwd(),
      path: process.cwd()
    },
    env: {
      NODE_ENV: env,
      GLAUNCHER_NAME: name,
      GLAUNCHER: 'true'
    },
    execCommand: 'node ' + (packageJSON ? packageJSON.main || 'node index.js' : 'node index.js')
  };

  /**
   * Simple is object check.
   * @param item
   * @returns {boolean}
   */
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param source
   */
  function mergeDeep(target, source) {
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }
    return target;
  }

  /**
   *
   * @param pull
   * @param remote
   * @param branch
   * @param retries
   * @returns {Promise}
   */
  function gitPull(pull, remote, branch, retries) {
    return new Promise(function (resolve, reject) {
      if (!pull) {
        return resolve();
      }
      console.log('GLAUNCHER: Beginning Git Pull...');
      pull(remote, branch, function (err) {
        if (err && err.includes('fatal: Not a git repository')) {
          console.error('Your project is not a git repository. Launch aborted.');
          return process.exit();
        }

        if (err) {
          console.error('GLAUNCHER: An error occurred when git pulling, error:\n');
          console.error(err);

          if (retries) {
            console.error('GLAUNCHER: Retrying git pull...');
            return reject();
          }

          console.error('GLAUNCHER: Launcher will now exit.');
          return process.exit();
        }
        console.log('GLAUNCHER: Git Pull completed!');
        return resolve();
      });
    });
  }

  /**
   *
   * @param install
   * @param options
   * @param retries
   * @returns {Promise}
   */
  function npmInstall(install, options, retries) {
    return new Promise(function (resolve, reject) {
      if (!install) {
        return resolve();
      }

      console.log('GLAUNCHER: Beginning NPM Install...');
      NpmInstall(options, function (err, result) {
        if (err) {
          console.error('GLAUNCHER: An error occurred when NPM Installing, error:');
          console.error('GLAUNCHER: ' + err);

          if (retries) {
            console.error('GLAUNCHER: Retrying NPM Install...');
            return reject(err);
          }

          console.error('GLAUNCHER: Launcher will now exit.');
          return process.exit();
        }

        console.log('GLAUNCHER: NPM Install completed!');
        return resolve();
      });
    });
  }

  /**
   *
   * @param command
   * @param envs
   * @returns {Promise}
   */
  function execCommand(command, envs) {
    console.log(`GLAUNCHER: Starting your app... (${command})`);
    return new Promise(function (resolve, reject) {
      console.log(config.env);
      const proc = exec(command, {
        env: envs
      });

      setTimeout(resolve, 15000);
    });
  }

  if (packageJSON && packageJSON.glauncher && packageJSON.glauncher[env]) {
    config = mergeDeep(config, packageJSON.glauncher[env]); // merge with defaults
    config.execCommand = config.execCommand.replace(/\$env/g, env);
    config.execCommand = config.execCommand.replace(/\$name/g, config.name);
  } else {
    console.warn('GLAUNCHER: Could not load project package.json file. Using defaults.');
  }

  gitPull(config.gitPull, config.gitRemote, config.gitBranch, config.retries)
    .timeout(60000) // 6o second timeout
    .then(function () {
      return npmInstall(config.npmInstall, config.npmInstallOptions, config.retries).timeout(60000)
    })
    .then(function () {
      return execCommand(config.execCommand, config.env)
    })
    .then(()=> {
      process.exit();
    })
    .catch(error => {
      throw error;
    });
}

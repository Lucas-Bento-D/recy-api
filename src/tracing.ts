import tracer from 'dd-trace';

if (process.env.DD_ENV === 'staging') {
  // TODO: integrate with pino logger
  // logger.info('Initializing Datadog tracing with the following settings:');
  // logger.info({ service: process.env.DD_SERVICE || 'recy-backend' }, 'Service');
  // logger.info({ env: process.env.DD_ENV }, 'Env');
  // logger.info({ version: process.env.DD_VERSION || '1.0.0' }, 'Version');
  // logger.info('Log Injection: true');

  tracer.init({
    service: process.env.DD_SERVICE || 'recy-backend',
    env: process.env.DD_ENV,
    version: process.env.DD_VERSION || '1.0.0',
    logInjection: true,
  });

  // logger.info('Datadog tracing initialized in the staging environment.');
} else {
  // logger.warn(
  //   { env: process.env.DD_ENV || 'Unknown' },
  //   'Datadog tracing not initialized.',
  // );
}

export default tracer;

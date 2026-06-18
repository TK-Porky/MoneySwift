export async function injectServiceMocks(serviceModuleOrPath, prismaMock, options = {}) {
  // serviceModuleOrPath can be an imported module object or a string path
  let svcModule;
  if (typeof serviceModuleOrPath === 'string') {
    svcModule = await import(serviceModuleOrPath);
  } else {
    svcModule = serviceModuleOrPath;
  }
  // Prefer default export if present
  const service = svcModule.default || svcModule;

  // If the module exposes __setPrisma, call it
  if (typeof svcModule.__setPrisma === 'function') {
    svcModule.__setPrisma(prismaMock);
  } else if (service && typeof service.__setPrisma === 'function') {
    service.__setPrisma(prismaMock);
  }

  // Handle sms provider injection
  if (options.smsProvider) {
    if (typeof svcModule.__setSmsProvider === 'function') {
      svcModule.__setSmsProvider(options.smsProvider);
    } else if (service && typeof service.__setSmsProvider === 'function') {
      service.__setSmsProvider(options.smsProvider);
    }
  }

  return service;
}

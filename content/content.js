(async () => {
  const swaggerUIWrapper = document.querySelector('#swagger-ui');
  if (!swaggerUIWrapper) return;

  await SwaggerUIAuthorizerModule.waitForSwaggerFunctions();

  // Save the original execute function
  const originalExecute = window.ui.getSystem().fn.execute;

  // Override the execute function
  window.ui.getSystem().fn.execute = async (...params) => {
    const preauthorizedParams = await SwaggerUIAuthorizerModule.preAuthorize(params);
    return originalExecute(...preauthorizedParams);
  };

  ExtStore.authorizations = SwaggerUIAuthorizerModule.authorizations;

  // Add the authorizer button
  const openAuthModalBtn = document.createElement('button');
  openAuthModalBtn.classList.add('btn', 'authorize');
  openAuthModalBtn.innerHTML = '<span>Swagger UI Authorizer</span>';
  openAuthModalBtn.addEventListener('click', () => {
    const authModal = document.createElement('auth-modal');
    document.querySelector('.scheme-container .auth-wrapper').appendChild(authModal);
  });

  document.querySelector('.scheme-container .auth-wrapper').insertAdjacentElement('afterbegin', openAuthModalBtn);
})()
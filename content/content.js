(async () => {
  const swaggerUIWrapper = document.querySelector('#swagger-ui');
  if (!swaggerUIWrapper) return;

  await SwaggerUIAuthorizerModule.waitForSwaggerFunctions();

  // Migrations
  const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
  authorizations.forEach((auth) => {
    if (auth.parameters && auth.securitySchemeName) {
      auth.security_scheme_name = auth.securitySchemeName;
      delete auth.securitySchemeName;
    }
    if (auth.parameters && auth.parameters.operation_id && !auth.profile_type) auth.profile_type = 'request';
    if (auth.parameters && auth.type) delete auth.type;
    if (auth.auth_value_source) {
      auth.parameters.auth_value_source = auth.auth_value_source;
      delete auth.auth_value_source;
    }

    SwaggerUIAuthorizerModule.saveAuthorization(auth);
  });

  // Save the original execute function
  const originalExecute = window.ui.getSystem().fn.execute;

  // Override the execute function
  window.ui.getSystem().fn.execute = async (...params) => {
    const preauthorizedParams = await SwaggerUIAuthorizerModule.preAuthorize(params);
    return originalExecute(...preauthorizedParams);
  };

  // Add the authorizer button
  const openAuthModalBtn = document.createElement('button');
  openAuthModalBtn.classList.add('btn', 'authorize');
  openAuthModalBtn.innerHTML = '<span>Swagger UI Authorizer</span>';
  openAuthModalBtn.addEventListener('click', () => {
    const authModal = document.createElement('auth-modal');
    document.querySelector('.scheme-container .auth-wrapper').appendChild(authModal);
  });

  document.querySelector('.scheme-container .auth-wrapper').insertAdjacentElement('afterbegin', openAuthModalBtn);


  SwaggerUIAuthorizerModule.waitForSelector('.auth-container .wrapper>code', (element) => {

    element.innerHTML += '👁';

    element.addEventListener('click', () => {
      const wrapper = element.closest('.auth-container');
      const authNameElement = wrapper.querySelector('h4 code');
      const savedSecurity = SwaggerUIAuthorizerModule.getSavedSecurity(authNameElement.innerHTML);

      const input = document.createElement('input');
      input.type = 'text';
      input.style.marginLeft = '10px';
      input.value = savedSecurity.value;

      element.after(input);

      const closeBtn = document.createElement('span');
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginLeft = '10px';
      closeBtn.innerHTML = '✖';
      closeBtn.addEventListener('click', () => {
        input.remove();
        closeBtn.remove();
        element.style.display = 'inline';
      });
      input.after(closeBtn);

      element.style.display = 'none';
    });
  });
})()
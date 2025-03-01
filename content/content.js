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

  // Add the authorizer button
  const openAuthModalBtn = document.createElement('button');
  openAuthModalBtn.style.marginRight = '10px';
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
      const authContainer = element.closest('.auth-container');
      const authNameElement = authContainer.querySelector('h4 code');
      const wrapper = element.closest('.wrapper');
      const savedSecurity = SwaggerUIAuthorizerModule.getSavedSecurity(authNameElement.innerHTML);

      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('readonly', true);
      input.style.marginLeft = '10px';

      if (wrapper.querySelector('label[for="auth-basic-username"]')) {
        input.value = savedSecurity.value.username;
      } else if (wrapper.querySelector('label[for="auth-basic-password"]')) {
        input.value = savedSecurity.value.password;
      } else {
        input.value = savedSecurity.value;
      }

      element.after(input);

      const closeBtn = document.createElement('span');
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginLeft = '10px';
      closeBtn.innerHTML = '✖';

      function hideValue() {
        input.remove();
        closeBtn.remove();
        element.style.display = 'inline';
      }
      closeBtn.addEventListener('click', () => hideValue());

      authContainer.querySelector('.btn.modal-btn.auth.button').addEventListener('click', () => hideValue());

      input.after(closeBtn);

      element.style.display = 'none';
    });
  });
})()
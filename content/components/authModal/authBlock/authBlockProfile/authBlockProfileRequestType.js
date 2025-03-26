class AuthBlockProfileRequestType extends HTMLElement {
  constructor() {
    super();

    const scheme = this.getAttribute('scheme');
    const profileId = this.getAttribute('profile-id');
    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes(scheme);
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);

    const APIPaths = SwaggerUIAuthorizerModule.getAPI().paths;

    const API = Object.keys(APIPaths).sort().map((path) => {
      const pathItem = APIPaths[path];
      return Object.keys(pathItem).map((method) => {
        const operation = pathItem[method];
        return {
          method: method,
          path: path,
          operation_id: operation.operationId,
        };
      });
    }).flat();

    const defaultProfile = {
      "security_scheme_name": securitySchemes.security_scheme_name,
      "scheme": securitySchemes.scheme,
      "label": "",
      "parameters": {
        "operation_id": API[0].operation_id,
        "headers": SwaggerUIAuthorizerModule.getRequestHeadersParams(API[0].operation_id),
        "query": SwaggerUIAuthorizerModule.getRequestQueryParams(API[0].operation_id),
        "parameters": SwaggerUIAuthorizerModule.getRequestPathParams(API[0].operation_id),
        "body": SwaggerUIAuthorizerModule.getRequestBodyParams(API[0].operation_id),
        "auth_value_source": '',
        "auth_value_ttl": '',
      },
      "profile_type": "request",
    };

    let schemeProfile = authorizations.find((auth) => auth.id === profileId) || defaultProfile;

    this.render = async () => {
      while (this.lastChild) this.removeChild(this.lastChild);

      const request = SwaggerUIAuthorizerModule.getRequestInfoByOperationId(schemeProfile.parameters.operation_id);

      const hasPathParams = Boolean((request.operation.parameters || []).filter((param) => param.in === 'path').length);
      const hasQueryParams = Boolean((request.operation.parameters || []).filter((param) => param.in === 'query').length);
      const hasHeaders = Boolean((request.operation.parameters || []).filter((param) => param.in === 'header').length);
      const hasBody = request.method !== 'get';

      const selectedRequest = API.find((request) => request.operation_id === schemeProfile.parameters.operation_id);

      const TEMPLATE_CONTENT = `
        <form>

            <div class="params-wrapper">
              <label>Profile name</label>
              <input title="Authorization profile name" spellcheck="false" placeholder="profile name" class="profile-name-value" type="text" required="true" value="${schemeProfile.label}" />
            </div>

            <div class="params-wrapper">
              <label>Request</label>
              <input title="Authorization request" spellcheck="false" class="request-id-input" type="text" value="${selectedRequest.method.toUpperCase()} - ${selectedRequest.path}" />
              <span class="select-arrow">˅</span>
              <select size="10" data-parameters-property="operation_id" class="request-id-select">
                ${API.map((request) => `<option ${schemeProfile.parameters.operation_id === request.operation_id ? 'selected' : ''} value="${request.operation_id}">${request.method.toUpperCase()} - ${request.path}</span></option>`).join('')}
              </select>
            </div>

            ${hasHeaders ? `
              <div class="params-wrapper">
                  <label>Headers</label>
                  <textarea title="Authorization request headers" spellcheck="false" data-parameters-property="headers" class="parameters-value">${JSON.stringify(schemeProfile.parameters.headers, null, 2)}</textarea>
              </div>  
            `: ''}


            ${hasQueryParams ? `
              <div class="params-wrapper">
                  <label>Query</label>
                  <textarea title="Authorization request query parameters" spellcheck="false" data-parameters-property="query" class="parameters-value">${JSON.stringify(schemeProfile.parameters.query, null, 2)}</textarea>
              </div>
            `: ''}

            ${hasPathParams ? `
              <div class="params-wrapper">
                  <label>Parameters</label>
                  <textarea title="Authorization request path parameters" spellcheck="false" data-parameters-property="parameters" class="parameters-value">${JSON.stringify(schemeProfile.parameters.parameters, null, 2)}</textarea>
              </div>
            ` : ''}

            ${hasBody ? `
              <div class="params-wrapper">
                <label>Body</label>
                <textarea title="Authorization request body" spellcheck="false" data-parameters-property="body" class="parameters-value">${JSON.stringify(schemeProfile.parameters.body, null, 2)}</textarea>
              </div>
            ` : ''}


            <div class="params-wrapper">
              <label>Value source</label>
              <input title="Path to authorization token" spellcheck="false" data-parameters-property="auth_value_source" class="parameters-value" type="text" required="true" placeholder="response.body.access_token" value="${schemeProfile.parameters.auth_value_source}" />
            </div>

            <div class="params-wrapper">
              <label>Value TTL (min)</label>
              <input title="Authorization token 'time to live' in minutes" spellcheck="false" data-parameters-property="auth_value_ttl" class="parameters-value" type="number" placeholder="auth token life time in minutes (not needed for JWT)" value="${schemeProfile.parameters.auth_value_ttl || ''}" />
            </div>

        </form>
        `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));


      this.querySelector('.request-id-input').addEventListener('click', (event) => {
        this.querySelector('.request-id-select').style.display = 'block';
        const selectBox = this.querySelector('.request-id-select');
        const options = selectBox.querySelectorAll('option');
        for (let i = 0; i < options.length; i++) {
          options[i].style.display = 'block';
        }

        const selectedOption = selectBox.querySelector('option[selected]');
        if (selectedOption) {
          selectedOption.scrollIntoView({ block: 'nearest' });
        }

        event.target.focus();
        event.target.value = '';
        event.stopPropagation();
      });

      this.querySelector('.request-id-input').addEventListener('input', (event) => {
        const searchValue = event.target.value.toLowerCase();
        const selectBox = this.querySelector('.request-id-select');
        const options = selectBox.querySelectorAll('option');

        // Show the select box when typing
        selectBox.style.display = 'block';

        for (let i = 0; i < options.length; i++) {
          const optionText = options[i].text.toLowerCase();
          if (optionText.includes(searchValue)) {
            options[i].style.display = 'block';
          } else {
            options[i].style.display = 'none';
          }
        }
      });

      this.querySelector('.request-id-input').addEventListener('keydown', (event) => {

        event.target.focus();

        if (event.key === 'Enter') {
          const selectBox = this.querySelector('.request-id-select');
          const selectedOption = selectBox.querySelector('option[selected]:not([style*="display: none"])');
          if (selectedOption) {
            this.querySelector('.request-id-input').value = selectedOption.text;
            selectBox.style.display = 'none';

            selectBox.value = selectedOption.value;
            selectBox.dispatchEvent(new Event('change'));

          }
          event.preventDefault();
          event.target.blur();
        }

        if (event.key === 'ArrowDown') {
          const selectBox = this.querySelector('.request-id-select');
          const selectedOption = selectBox.querySelector('option[selected]:not([style*="display: none"])');
          if (selectedOption) {
            selectedOption.removeAttribute('selected');
            let nextOption = selectedOption.nextElementSibling;
            while (nextOption && nextOption.style.display === 'none') {
              nextOption = nextOption.nextElementSibling;
            }
            if (nextOption) {
              nextOption.setAttribute('selected', 'selected');
            } else {
              let firstOption = selectBox.querySelector('option:not([style*="display: none"])');
              if (firstOption) {
                firstOption.setAttribute('selected', 'selected');
              }
            }
          } else {
            let firstOption = selectBox.querySelector('option:not([style*="display: none"])');
            if (firstOption) {
              firstOption.setAttribute('selected', 'selected');
            }
          }
          event.preventDefault();
        }

        if (event.key === 'ArrowUp') {
          const selectBox = this.querySelector('.request-id-select');
          const selectedOption = selectBox.querySelector('option[selected]:not([style*="display: none"])');
          if (selectedOption) {
            selectedOption.removeAttribute('selected');
            let prevOption = selectedOption.previousElementSibling;
            while (prevOption && prevOption.style.display === 'none') {
              prevOption = prevOption.previousElementSibling;
            }
            if (prevOption) {
              prevOption.setAttribute('selected', 'selected');
            } else {
              let lastOption = selectBox.querySelector('option:not([style*="display: none"]):last-child');
              if (lastOption) {
                lastOption.setAttribute('selected', 'selected');
              }
            }
          } else {
            let lastOption = selectBox.querySelector('option:not([style*="display: none"]):last-child');
            if (lastOption) {
              lastOption.setAttribute('selected', 'selected');
            }
          }
          event.preventDefault();
        }
      });


      // Hide the select box when clicking outside
      document.addEventListener('click', (event) => {
        const selectBox = this.querySelector('.request-id-select');
        const searchInput = this.querySelector('.request-id-input');
        if (event.target !== searchInput && event.target !== selectBox) {
          selectBox.style.display = 'none';
        }
        searchInput.value = `${selectedRequest.method.toUpperCase()} - ${selectedRequest.path}`;
      });


      this.querySelector('select').addEventListener('change', (event) => {

        this.querySelector('.request-id-select').style.display = 'none';

        schemeProfile.parameters.operation_id = event.target.value;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));

        schemeProfile.parameters.query = SwaggerUIAuthorizerModule.getRequestQueryParams(schemeProfile.parameters.operation_id);

        schemeProfile.parameters.parameters = SwaggerUIAuthorizerModule.getRequestPathParams(schemeProfile.parameters.operation_id);

        schemeProfile.parameters.headers = SwaggerUIAuthorizerModule.getRequestHeadersParams(schemeProfile.parameters.operation_id);

        schemeProfile.parameters.body = SwaggerUIAuthorizerModule.getRequestBodyParams(schemeProfile.parameters.operation_id);

        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));

        this.render();
      });

      this.querySelectorAll('.parameters-value').forEach((element) => {
        element.addEventListener('change', (event) => {

          if (event.target.dataset.parametersProperty === 'auth_value_ttl') {
            if (event.target.value && event.target.value <= 0) { event.target.classList.add('invalid'); return; }
            event.target.classList.remove('invalid');
          }

          if (event.target.dataset.parametersProperty === 'auth_value_source') {
            if (!event.target.value) { event.target.classList.add('invalid'); return; }
            event.target.classList.remove('invalid');
          }

          if (event.target.tagName === 'TEXTAREA') {
            try {
              JSON.parse(event.target.value);
              event.target.classList.remove('invalid');
            } catch (error) {
              event.target.classList.add('invalid');
              return;
            }
          }

          if (event.target.tagName === 'TEXTAREA') {
            schemeProfile.parameters[event.target.dataset.parametersProperty] = event.target.value ? JSON.parse(event.target.value) : null;
          } else {
            schemeProfile.parameters[event.target.dataset.parametersProperty] = event.target.value;
          }
          this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        });
      });

      this.querySelector('input.profile-name-value').addEventListener('change', (event) => {

        if (!event.target.value) { event.target.classList.add('invalid'); return; }
        event.target.classList.remove('invalid');

        schemeProfile.label = event.target.value;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
      });

      return true;
    }
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) this.rendered = this.render();
  }
}

customElements.define('auth-block-profile-request-type', AuthBlockProfileRequestType);

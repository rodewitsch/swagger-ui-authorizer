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
      "label": "Profile name",
      "parameters": {
        "operation_id": API[0].operation_id,
        "headers": {},
        "query": {},
        "parameters": {},
        "body": {},
        "auth_value_source": null,
      },
      "profile_type": "request",
    };

    let schemeProfile = authorizations.find((auth) => auth.id === profileId) || defaultProfile;



    this.render = async () => {
      while (this.lastChild) this.removeChild(this.lastChild);

      const request = SwaggerUIAuthorizerModule.getRequestInfoByOperationId(schemeProfile.parameters.operation_id);

      const hasPathParams = Boolean(request.operation.parameters.filter((param) => param.in === 'path').length);
      const hasQueryParams = Boolean(request.operation.parameters.filter((param) => param.in === 'query').length);
      const hasHeaders = Boolean(request.operation.parameters.filter((param) => param.in === 'header').length);
      const hasBody = request.method !== 'get';

      let TEMPLATE_CONTENT;
      TEMPLATE_CONTENT = `
        <style>
          .method {
            font-weight: bold;
          }
          auth-block-profile-request-type .params-wrapper {
            display: flex;
            flex-direction: row;
          }
          auth-block-profile-request-type .params-wrapper label {
            width: 100px;
            padding-top: 10px;
          }
          auth-block-profile-request-type .params-wrapper select {
            box-shadow: none;
            background-color: hsla(0,0%,100%,.8);
            cursor: pointer;
            outline: none;
            border: none;
            margin: 5px 0 5px 8px;
            width: 100%;
            border: 2px solid #d9d9d9;
          }          
          auth-block-profile-request-type .params-wrapper select:focus, 
          auth-block-profile-request-type .params-wrapper select:focus-visible {
            border: 2px solid #61affe;
          }
          auth-block-profile-request-type .params-wrapper textarea {
            min-height: 100px !important;
            height: 100px;
            margin-left: 8px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .25);
            resize: vertical;
          }          
          auth-block-profile-request-type .params-wrapper input[type="text"]:focus, 
          auth-block-profile-request-type .params-wrapper input[type="text"]:focus-visible {
            border: 2px solid #61affe;
          }
          auth-block-profile-request-type .params-wrapper input[type="text"] {
            font-family: monospace;
            font-size: 12px;
            font-weight: 600;
            outline: none;
            height: 30px;
            width: 100%;
            color: #3b4151;
            margin-left: 8px;
          }
          auth-block-profile .opblock-summary {
            padding: 5px;
          }    
          auth-block-profile .profile-type-wrapper.opblock-section-header {
            padding: 8px 10px !important;
          }      
          auth-block-profile .profile-type-wrapper.opblock-section-header>label {
            margin: 0 !important;
          }
          auth-block-profile-request-type form {
            padding: 10px;
          }
        </style>
        <form>

            <div class="params-wrapper">
              <label>Profile name</label>
              <input spellcheck="false" class="profile-name-value" type="text" value="${schemeProfile.label}" />
            </div>

            <div class="params-wrapper">
              <label>Request</label>
              <select>
                <option value="choose request">Choose request</option>
                ${API.map((request) => `<option ${schemeProfile.parameters.operation_id === request.operation_id ? 'selected' : ''} value="${request.operation_id}">${request.method.toUpperCase()} - ${request.path}</span></option>`).join('')}
              </select>
            </div>

            ${hasHeaders ? `
              <div class="params-wrapper">
                  <label>Headers</label>
                  <textarea spellcheck="false" class="headers-value">${JSON.stringify(schemeProfile.parameters.headers, null, 2)}</textarea>
              </div>  
            `: ''}


            ${hasQueryParams ? `
              <div class="params-wrapper">
                  <label>Query</label>
                  <textarea spellcheck="false" class="query-value">${JSON.stringify(schemeProfile.parameters.query, null, 2)}</textarea>
              </div>
            `: ''}

            ${hasPathParams ? `
              <div class="params-wrapper">
                  <label>Parameters</label>
                  <textarea spellcheck="false" class="parameters-value">${JSON.stringify(schemeProfile.parameters.parameters, null, 2)}</textarea>
              </div>
            ` : ''}

            ${hasBody ? `
              <div class="params-wrapper">
                <label>Body</label>
                <textarea spellcheck="false" class="body-value">${JSON.stringify(schemeProfile.parameters.body, null, 2)}</textarea>
              </div>
            ` : ''}


            <div class="params-wrapper">
              <label>Value source</label>
              <input spellcheck="false" class="source-value" type="text" placeholder="response.body.access_token" value="${schemeProfile.parameters.auth_value_source}" />
            </div>

        </form>
        `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('select').addEventListener('change', (event) => {
        schemeProfile.parameters.operation_id = event.target.value;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));

        const request = SwaggerUIAuthorizerModule.getRequestInfoByOperationId(event.target.value);

        const queryParams = request.operation.parameters.filter((param) => param.in === 'query');

        if (queryParams.length) {
          schemeProfile.parameters.query = queryParams.reduce((acc, param) => {
            acc[param.name] = '';
            return acc;
          }, {});
        } else {
          schemeProfile.parameters.query = {};
        }

        const pathParams = request.operation.parameters.filter((param) => param.in === 'path');

        if (pathParams.length) {
          schemeProfile.parameters.parameters = pathParams.reduce((acc, param) => {
            acc[param.name] = '';
            return acc;
          }, {});
        } else {
          schemeProfile.parameters.parameters = {};
        }

        const headersParams = request.operation.parameters.filter((param) => param.in === 'header');

        if (headersParams.length) {
          schemeProfile.parameters.headers = headersParams.reduce((acc, param) => {
            acc[param.name] = '';
            return acc;
          }, {});
        } else {
          schemeProfile.parameters.headersParams = {};
        }

        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));

        this.render();
      });

      this.querySelector('input.profile-name-value') && this.querySelector('input.profile-name-value').addEventListener('change', (event) => {
        schemeProfile.label = event.target.value;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
      });      
      
      this.querySelector('input.source-value') && this.querySelector('input.source-value').addEventListener('change', (event) => {
        schemeProfile.parameters.auth_value_source = event.target.value;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
      });

      this.querySelector('textarea.headers-value') && this.querySelector('textarea.headers-value').addEventListener('change', (event) => {
        schemeProfile.parameters.headers = event.target.value ? JSON.parse(event.target.value) : null;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
      });

      this.querySelector('textarea.body-value') && this.querySelector('textarea.body-value').addEventListener('change', (event) => {
        schemeProfile.parameters.body = event.target.value ? JSON.parse(event.target.value) : null;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
      });

      this.querySelector('textarea.query-value') && this.querySelector('textarea.query-value').addEventListener('change', (event) => {
        schemeProfile.parameters.query = event.target.value ? JSON.parse(event.target.value) : null;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
      });

      this.querySelector('textarea.parameters-value') && this.querySelector('textarea.parameters-value').addEventListener('change', (event) => {
        schemeProfile.parameters.parameters = event.target.value ? JSON.parse(event.target.value) : null;
        this.dispatchEvent(new CustomEvent('profile-changed', { bubbles: true, detail: schemeProfile }));
        this.render();
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

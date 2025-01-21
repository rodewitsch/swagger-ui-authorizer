class AuthBlockProfileBody extends HTMLElement {
  constructor() {
    super();



    const scheme = this.getAttribute('scheme');
    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes(scheme);
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);

    const defaultProfile = {
      "securitySchemeName": securitySchemes.securitySchemeName,
      "scheme": securitySchemes.scheme,
      "label": "Add profile",
      "parameters": {
        "operation_id": "AuthControllerV7_signin",
        "headers": {},
        "query": {},
        "parameters": {},
        "body": {},
      },
      "auth_value_source": "response.body.token"
    };

    const schemeProfile = authorizations.find((auth) => auth.id === this.getAttribute('profile-id')) || defaultProfile;

    this.render = async () => {
      let TEMPLATE_CONTENT;
      TEMPLATE_CONTENT = `
        <style>
        </style>

        <div>
          <textarea>${JSON.stringify(schemeProfile, null, 2)}</textarea>
          <button class="save">Save</button>
          <button class="cancel">Cancel</button>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('button.save').addEventListener('click', () => {
        const newProfile = JSON.parse(this.querySelector('textarea').value);
        SwaggerUIAuthorizerModule.saveAuthorization(newProfile);
        ExtStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
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

customElements.define('auth-block-profile-body', AuthBlockProfileBody);

class AuthBlock extends HTMLElement {
  constructor() {
    super();

    const scheme = SwaggerUIAuthorizerModule.getSecuritySchemes(this.getAttribute('scheme'));
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
    const schemeProfiles = authorizations.filter((auth) => auth.scheme === scheme.securitySchemeName);

    this.render = async () => {
      let TEMPLATE_CONTENT;
      TEMPLATE_CONTENT = `
        <style>
          .auth-block h4 {
            display: flex;
            justify-content: space-between;
          }
          auth-block-profile {
            border-bottom: 1px solid rgba(59, 65, 81, .3);
          }
        </style>

        <div class="auth-block">
          <h4><span><code>${scheme.securitySchemeName}</code>
            &nbsp; (${scheme.scheme}, ${scheme.type})</span>

            <div>
              <label>Current profile</label>
              <select class="current-profile-selector" aria-label="Media Type" class="content-type">
                <option value="">Disabled</option>
                ${schemeProfiles.map((profile) => `<option ${profile.current ? 'selected' : ''} value="${profile.label}">${profile.label}</option>`)}
              </select>
            </div>
          </h4>
          <div class="wrapper">
           ${schemeProfiles.map((profile) => `<auth-block-profile scheme="${this.getAttribute('scheme')}" profile-id="${profile.id}"></auth-block-profile>`).join('')}
           <auth-block-profile scheme="${this.getAttribute('scheme')}"></auth-block-profile>
          </div>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('.current-profile-selector').addEventListener('change', (event) => {
        schemeProfiles.forEach((auth) => {
          auth.current = false;
          if (auth.label === event.target.value) auth.current = true;
          SwaggerUIAuthorizerModule.saveAuthorization(auth);
        });
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

customElements.define('auth-block', AuthBlock);

class AuthBlock extends HTMLElement {
  constructor() {
    super();

    const scheme = SwaggerUIAuthorizerModule.getSecuritySchemes(this.getAttribute('scheme'));
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
    const schemeProfiles = authorizations.filter((auth) => auth.security_scheme_name === scheme.security_scheme_name);

    this.render = async () => {
      const TEMPLATE_CONTENT = `
        <div class="auth-block">
          <h4><span><code>${scheme.security_scheme_name}</code>
            &nbsp; (${scheme.scheme ? `${scheme.scheme}, ` : ''}${scheme.type})</span>
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
        SwaggerUIAuthorizerModule.unauthorize(scheme.security_scheme_name);
        schemeProfiles.forEach((auth) => {
          auth.current = false;
          if (auth.label === event.target.value) auth.current = true;
          SwaggerUIAuthorizerModule.saveAuthorization(auth);
        });
        SwaggerUIAuthorizationStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
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

class AuthBlockProfileCredentialsType extends HTMLElement {
  constructor() {
    super();

    const scheme = this.getAttribute('scheme');
    const profileId = this.getAttribute('profile-id');
    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes(scheme);
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);

    const defaultProfile = {
      "security_scheme_name": securitySchemes.security_scheme_name,
      "scheme": securitySchemes.scheme,
      "label": "",
      "parameters": {
        "login": "",
        "password": "",
      },
      "profile_type": "credentials",
    };

    let schemeProfile = authorizations.find((auth) => auth.id === profileId) || defaultProfile;

    this.render = async () => {
      while (this.lastChild) this.removeChild(this.lastChild);

      const TEMPLATE_CONTENT = `
        <form>

            <div class="params-wrapper">
              <label>Profile name</label>
              <input title="Authorization profile name" spellcheck="false" placeholder="profile name" class="profile-name-value" type="text" required="true" value="${schemeProfile.label}" />
            </div>

            <div class="params-wrapper">
              <label>Value source</label>
              <input title="Login" spellcheck="false" data-parameters-property="login" class="parameters-value" type="text" autocomplete="new-text" required="true" placeholder="login" value="${schemeProfile.parameters.login || ''}" />
            </div>            
            
            <div class="params-wrapper">
              <label>Value source</label>
              <input title="Password" spellcheck="false" data-parameters-property="password" class="parameters-value" type="password" autocomplete="new-password" required="true" placeholder="password" value="${schemeProfile.parameters.password || ''}" />
            </div>

        </form>
        `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));


      this.querySelectorAll('.parameters-value').forEach((element) => {
        element.addEventListener('change', (event) => {

          if (event.target.dataset.parametersProperty === 'login') {
            if (!event.target.value) { event.target.classList.add('invalid'); return; }
            event.target.classList.remove('invalid');
          }

          if (event.target.dataset.parametersProperty === 'password') {
            if (!event.target.value) { event.target.classList.add('invalid'); return; }
            event.target.classList.remove('invalid');
          }

          schemeProfile.parameters[event.target.dataset.parametersProperty] = event.target.value;

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

customElements.define('auth-block-profile-credentials-type', AuthBlockProfileCredentialsType);

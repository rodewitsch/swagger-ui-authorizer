class AuthBlockProfile extends HTMLElement {
  constructor() {
    super();

    const profileId = this.getAttribute('profile-id');
    const scheme = this.getAttribute('scheme');
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);
    const schemeProfile = authorizations.find((auth) => auth.id === profileId);

    this.render = async () => {
      let TEMPLATE_CONTENT;
      TEMPLATE_CONTENT = `
        <style>
          .header {
            cursor: pointer;
          }
          auth-block-profile-body {
            height: 0;
            display: block;
            overflow: hidden;
          }
          auth-block-profile-body.open {
            height: auto;
          }
        </style>

        <div>
          <div class="header">
            <h5>${schemeProfile && schemeProfile.label || 'Add profile'}</h5>
          </div>
          <auth-block-profile-body scheme="${scheme}" profile-id="${schemeProfile && schemeProfile.id}"></auth-block-profile-body>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('.header').addEventListener('click', () => {
        this.querySelector('auth-block-profile-body').classList.toggle('open');
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

customElements.define('auth-block-profile', AuthBlockProfile);

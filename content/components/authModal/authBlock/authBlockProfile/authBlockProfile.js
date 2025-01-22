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
            height: 35px;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          auth-block-profile:not(.open)[profile-id] .header::after {
            content: "˅";
          }
          auth-block-profile.open[profile-id] .header::after {
            content: "˄";
          }
          auth-block-profile:not(.open) .header::after {
            content: "+";
          }
          auth-block-profile.open .header::after {
            content: "x";
          }
          auth-block-profile-body {
            height: 0;
            display: block;
            overflow: hidden;
          }
          auth-block-profile.open auth-block-profile-body {
            height: auto;
          }
        </style>

        <div>
          <div class="header">
            <h5>${schemeProfile && schemeProfile.label || 'add new profile'}</h5>
            <span>${schemeProfile && schemeProfile.id ? '' : ''}</span>
          </div>
          <auth-block-profile-body scheme="${scheme}" profile-id="${schemeProfile && schemeProfile.id}"></auth-block-profile-body>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('.header').addEventListener('click', () => {
        this.classList.toggle('open');
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

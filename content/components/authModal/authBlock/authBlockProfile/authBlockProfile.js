const arrowDown = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="arrow" width="20" height="20" aria-hidden="true" focusable="false"><path d="M 17.418 14.908 C 17.69 15.176 18.127 15.176 18.397 14.908 C 18.667 14.64 18.668 14.207 18.397 13.939 L 10.489 6.109 C 10.219 5.841 9.782 5.841 9.51 6.109 L 1.602 13.939 C 1.332 14.207 1.332 14.64 1.602 14.908 C 1.873 15.176 2.311 15.176 2.581 14.908 L 10 7.767 L 17.418 14.908 Z"></path></svg>';


class AuthBlockProfile extends HTMLElement {
  constructor() {
    super();

    const scheme = this.getAttribute('scheme');
    const profileId = this.getAttribute('profile-id');
    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes(scheme);
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);

    const profileIdentifier = `${securitySchemes.security_scheme_name}-${profileId}`;

    let schemeProfile = authorizations.find((auth) => auth.id === profileId);

    const profileType = (schemeProfile && schemeProfile.profile_type) || 'request';

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
            border-radius: 5px 5px 0 0;
            padding-left: 15px !important;
            padding-right: 15px !important;
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
          .body {
            display: none;
          }
          auth-block-profile.open .opblock-summary {
            border-bottom: 1px solid #000;
          }
          auth-block-profile.open .body {
            display: block;
            padding: 15px;
          }
          .radio-wrapper {
            display: flex;
            cursor: not-allowed;
            align-items: center;
            justify-content: center;
          }
          .profile-type-wrapper {
            display: flex;
            flex-direction: row;
            align-items: center;
            cursor: pointer;
          }
          .profile-type-wrapper label {
            cursor: pointer;
            width: 100px;
          }
          .profile-type-wrapper .profile-type-selector {
            display: flex;
            margin-left: 8px;
          }
          .profile-type-selector label {
            padding: 0 0 0 0;
            margin: 0 0 0 10px;
          }
          .profile-type-selector input {
            cursor: pointer;
          }
          .buttons-wrapper {
            margin-top: 10px;
            display: flex;
            justify-content: center;
          }
          .buttons-wrapper button {
            margin-right: 10px;
          }
        </style>
        <div class="opblock ${schemeProfile && schemeProfile.id ? 'opblock-get' : 'opblock-post'}">

          <div class="header opblock-summary opblock-summary-get">
            <h5>${schemeProfile && schemeProfile.label || 'add new profile'}</h5>
            <span>${schemeProfile && schemeProfile.id ? '' : ''}</span>
          </div>


          <div class="body opblock-body">

            <div class="profile-type-wrapper opblock-section-header">

              <label>Profile type</label>

              <div class="profile-type-selector">

                <div class="radio-wrapper" style="cursor: not-allowed;">
                  <input style="pointer-events: none;" type="radio" id="${profileIdentifier}-key" name="${profileIdentifier}-profile-type" value="value" ${profileType === 'value' ? 'checked' : ''} />
                  <label style="pointer-events: none;" for="${profileIdentifier}-key">value</label>
                </div>

                <div class="radio-wrapper" style="cursor: pointer;">
                  <input type="radio" id="${profileIdentifier}-request" name="${profileIdentifier}-profile-type" value="request" ${profileType === 'request' ? 'checked' : ''}  />
                  <label for="${profileIdentifier}-request">request</label>
                </div>

              </div>
            
            </div>


            ${profileType === 'request' ? `<auth-block-profile-request-type scheme="${scheme}" profile-id="${profileId}"></auth-block-profile-request-type>` : ''}
            
            ${profileType === 'value' ? '<auth-block-profile-value-type></auth-block-profile-value-type>' : ''}

            <div class="buttons-wrapper">
              <button class="btn save">Save</button>
              ${schemeProfile && schemeProfile.id ? `<button class="btn remove">Remove</button>` : ''}
              <button class="btn close">Cancel</button>
            </div>
          </div>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;

      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('.header').addEventListener('click', () => {
        this.classList.toggle('open');
      });

      this.querySelector('button.save') && this.querySelector('button.save').addEventListener('click', () => {
        SwaggerUIAuthorizerModule.saveAuthorization(schemeProfile);
        ExtStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
      });

      this.querySelector('button.remove') && this.querySelector('button.remove').addEventListener('click', () => {
        if (!confirm('Are you sure you want to remove this profile?')) return;
        SwaggerUIAuthorizerModule.removeAuthorization(schemeProfile.id);
        ExtStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
      });

      this.querySelector('button.close') && this.querySelector('button.close').addEventListener('click', (event) => {
        event.currentTarget.closest('auth-block-profile').classList.toggle('open');
      });

      (this.querySelectorAll(`input[name="${profileIdentifier}-profile-type"]`) || []).forEach((radio) => {
        radio.addEventListener('change', (event) => {
          schemeProfile.profile_type = document.querySelector(`input[name="${profileIdentifier}-profile-type"]:checked`).value;
          this.querySelector('textarea').value = JSON.stringify(schemeProfile, null, 2);
        });
      });

      this.addEventListener('profile-changed', (event) => {
        schemeProfile = event.detail;
        event.stopPropagation();
        event.preventDefault();
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

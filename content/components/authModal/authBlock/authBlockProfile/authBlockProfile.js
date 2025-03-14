class AuthBlockProfile extends HTMLElement {
  constructor() {
    super();

    const scheme = this.getAttribute('scheme');
    const profileId = this.getAttribute('profile-id');
    const securityScheme = SwaggerUIAuthorizerModule.getSecuritySchemes(scheme);
    const authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations(scheme);

    const profileIdentifier = `${securityScheme.security_scheme_name}-${profileId}`;

    let schemeProfile = authorizations.find((auth) => auth.id === profileId);

    const getAvailableProfileTypes = () => {
      const availableProfileTypes = [];
      if (securityScheme.scheme === 'bearer') availableProfileTypes.push('request', 'value');
      if (securityScheme.type === 'apiKey') availableProfileTypes.push('request', 'value');
      if (securityScheme.scheme === 'basic' && securityScheme.type === 'http') availableProfileTypes.push('credentials');
      return availableProfileTypes;
    }

    this.render = async () => {


      const profileType = (schemeProfile && schemeProfile.profile_type) || getAvailableProfileTypes()[0];

      while (this.lastChild) this.removeChild(this.lastChild);

      const TEMPLATE_CONTENT = `
        <div class="opblock ${schemeProfile && schemeProfile.id ? 'opblock-get' : 'opblock-post'}">

          <div class="opblock-summary opblock-summary-get">
            <div>
              <h5>${schemeProfile && schemeProfile.label || 'add new profile'}</h5>
              <span class="opblock-summary-description">${schemeProfile && schemeProfile.id ? `[${profileType}]` : ''}</span>
            </div>
          </div>


          <div class="opblock-body">
            <div class="profile-type-wrapper opblock-section-header">
              <label>Profile type</label>
              ${schemeProfile && schemeProfile.id
          ? `<label style="padding-left: 10px">${profileType}</label>`
          : `<div class="profile-type-selector">
                
                  <div title="Authorization profile that performs authorization request (API key)" class="radio-wrapper ${getAvailableProfileTypes().includes('request') ? '' : 'hidden'}">
                    <input type="radio" id="${profileIdentifier}-request" name="${profileIdentifier}-profile-type" value="request" ${profileType === 'request' ? 'checked' : ''}  />
                    <label for="${profileIdentifier}-request">request</label>
                  </div>
                  
                  <div title="Authorization profile based on constant token (API key)" class="radio-wrapper ${getAvailableProfileTypes().includes('value') ? '' : 'hidden'}">
                    <input type="radio" id="${profileIdentifier}-key" name="${profileIdentifier}-profile-type" value="value" ${profileType === 'value' ? 'checked' : ''} />
                    <label for="${profileIdentifier}-key">value</label>
                  </div>
                  
                  <div title="Authorization profile based on login/password (HTTP Basic)" class="radio-wrapper ${getAvailableProfileTypes().includes('credentials') ? '' : 'hidden'}">
                    <input type="radio" id="${profileIdentifier}-credentials" name="${profileIdentifier}-profile-type" value="credentials" ${profileType === 'credentials' ? 'checked' : ''}  />
                    <label for="${profileIdentifier}-credentials">credentials</label>
                  </div>

                </div>
              `}
            </div>


            ${profileType === 'request' ? `<auth-block-profile-request-type scheme="${scheme}" profile-id="${profileId}"></auth-block-profile-request-type>` : ''}
            
            ${profileType === 'value' ? `<auth-block-profile-value-type scheme="${scheme}" profile-id="${profileId}"></auth-block-profile-value-type>` : ''}

            ${profileType === 'credentials' ? `<auth-block-profile-credentials-type scheme="${scheme}" profile-id="${profileId}"></auth-block-profile-credentials-type>` : ''}

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

      this.querySelector('.opblock-summary').addEventListener('click', () => {
        this.classList.toggle('open');
      });

      const saveBtn = this.querySelector('button.save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const invalidElement = this.querySelector('input.invalid, textarea.invalid') || Array.from(this.querySelectorAll('input[required]')).find((input) => !input.value);
          if (invalidElement) {
            invalidElement.classList.add('invalid');
            invalidElement.focus();
            return false;
          }
          SwaggerUIAuthorizerModule.saveAuthorization(schemeProfile);
          SwaggerUIAuthorizationStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
        });
      }

      const removeBtn = this.querySelector('button.remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          if (!confirm('Are you sure you want to remove this profile?')) return;
          SwaggerUIAuthorizerModule.removeAuthorization(schemeProfile.id);
          SwaggerUIAuthorizationStore.authorizations = SwaggerUIAuthorizerModule.getSavedAuthorizations();
        });
      }

      const closeBtn = this.querySelector('button.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (event) => {
          event.currentTarget.closest('auth-block-profile').classList.toggle('open');
          if (schemeProfile && schemeProfile.id) {
            schemeProfile = authorizations.find((auth) => auth.id === profileId);
          } else {
            schemeProfile = null;
          }
          this.render();
        });

      }

      (this.querySelectorAll(`input[name="${profileIdentifier}-profile-type"]`) || []).forEach((radio) => {
        radio.addEventListener('change', () => {
          if (!schemeProfile) schemeProfile = {};
          schemeProfile.profile_type = document.querySelector(`input[name="${profileIdentifier}-profile-type"]:checked`).value;
          this.render();
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

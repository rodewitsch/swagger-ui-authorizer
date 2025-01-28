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

      while (this.lastChild) this.removeChild(this.lastChild);

      const TEMPLATE_CONTENT = `
        <div class="opblock ${schemeProfile && schemeProfile.id ? 'opblock-get' : 'opblock-post'}">

          <div class="opblock-summary opblock-summary-get">
            <h5>${schemeProfile && schemeProfile.label || 'add new profile'}</h5>
            <span>${schemeProfile && schemeProfile.id ? '' : ''}</span>
          </div>


          <div class="opblock-body">
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

      this.querySelector('.opblock-summary').addEventListener('click', () => {
        this.classList.toggle('open');
      });

      const saveBtn = this.querySelector('button.save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const invalidForm = this.querySelector('input.invalid, textarea.invalid');
          if (invalidForm) return alert('Fields contain invalid values');
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
          this.render();
        });

      }

      (this.querySelectorAll(`input[name="${profileIdentifier}-profile-type"]`) || []).forEach((radio) => {
        radio.addEventListener('change', () => {
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

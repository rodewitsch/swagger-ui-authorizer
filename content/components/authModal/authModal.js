class AuthModal extends HTMLElement {
  constructor() {
    super();

    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes();

    this.subscriptions = [SwaggerUIAuthorizationStore.subscribe('authorizations', () => this.render())];

    this.render = async () => {
      while (this.lastChild) this.removeChild(this.lastChild);

      const TEMPLATE_CONTENT = `
        <div class="dialog-ux">
          <div class="backdrop-ux"></div>
          <div class="modal-ux">
            <div class="modal-dialog-ux">
              <div class="modal-ux-inner">
                <div class="modal-ux-header">
                  <h3>Available authorizations</h3>
                  <a class="donate" href="https://boosty.to/rodevich/donate" target="_blank" rel="noopener noreferrer" title="Donate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
                      <path d="m 145,312 c -2,69 31,100 104,102 78,1 113,-34 109,-101 -6,-58 -62,-73 -106,-79 -48,-17 -99,-25 -99,-95 0,-48 32,-79 99,-78 60,0 97,25 96,84" fill="none" stroke="currentColor" stroke-width="40"/>
                      <path d="m 250,15 0,470" stroke="currentColor" stroke-width="30"/>
                    </svg>
                    <span>Donate</span>
                  </a>
                  <button type="button" class="close-modal">✖</button>
                </div>
                <div class="modal-ux-content">
                  <div class="auth-container">
                    ${securitySchemes.map((scheme) => `<auth-block scheme="${scheme.security_scheme_name}"></auth-block>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const TEMPLATE = document.createElement('template');
      TEMPLATE.innerHTML = TEMPLATE_CONTENT;
      this.appendChild(TEMPLATE.content.cloneNode(true));

      this.querySelector('button.close-modal').addEventListener('click', () => this.remove(), { once: true });

      return true;
    }

    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.remove();
    };
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) { this.rendered = this.render(); }
    document.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.subscriptions.forEach((subscription) => SwaggerUIAuthorizationStore.unsubscribe(subscription));
  }
}

customElements.define('auth-modal', AuthModal);

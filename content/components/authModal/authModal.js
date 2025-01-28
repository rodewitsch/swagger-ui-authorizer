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
  }

  /**
   * Called when the element is added to the document.
   */
  connectedCallback() {
    if (!this.rendered) { this.rendered = this.render(); }
  }

  /**
   * Called when the element is removed from the document.
   */
  disconnectedCallback() {
    this.subscriptions.forEach((subscription) => SwaggerUIAuthorizationStore.unsubscribe(subscription));
  }
}

customElements.define('auth-modal', AuthModal);

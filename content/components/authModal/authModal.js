class AuthModal extends HTMLElement {
  constructor() {
    super();

    const securitySchemes = SwaggerUIAuthorizerModule.getSecuritySchemes();

    this.subscriptions = [ExtStore.subscribe('authorizations', () => this.render())];

    this.render = async () => {
      console.log('Rendering AuthModal');

      while (this.lastChild) this.removeChild(this.lastChild);

      let TEMPLATE_CONTENT;
      TEMPLATE_CONTENT = `
        <style>
          .modal-ux {
            width: 55vw !important;
            max-width: 55vw !important;
            min-width: 55vw !important;
          }
          .modal-ux .auth-container {
            padding: 0 !important;
          }
          .modal-ux .opblock-tag {
            padding: 10px 20px 10px 20px !important;
          }
          .modal-ux .auth-container auth-block-profile {
            display: block;
          }
        </style>

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
                      ${securitySchemes.map((scheme) => `<auth-block scheme="${scheme.securitySchemeName}"></auth-block>`).join('')}
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
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach((subscription) => ExtStore.unsubscribe(subscription));
    }
  }
}

customElements.define('auth-modal', AuthModal);

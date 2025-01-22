const SwaggerUIAuthorizerModule = (() => {
  return {
    assetsCache: {},
    apiCache: null,
    authorizations: [],
    delay: function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    waitForSwaggerFunctions: async function () {
      let attempts = 100;

      while (attempts) {
        try {
          this.getAPI();
          return;
        } catch {
          await this.delay(500);
          attempts--;
        }
      }

      throw new Error('Swagger UI is not ready');
    },
    getAPI: function () {
      if (this.apiCache) return this.apiCache;
      this.apiCache = JSON.parse(window.ui.spec()._root.entries[0][1]);
      return api;
    },
    getRequestInfoByOperationId: function (operationId) {
      const API = this.getAPI();
      const paths = API.paths;
      for (const path in paths) {
        for (const method in paths[path]) {
          const operation = paths[path][method];
          if (operation.operationId === operationId) {
            return {
              path,
              method,
              operation
            };
          }
        }
      }
      return null;
    },
    getSecuritySchemes: function (name) {
      const API = this.getAPI();
      const securitySchemesObj = API.components.securitySchemes;
      const securitySchemes = Object.keys(securitySchemesObj).map(scheme => ({ ...securitySchemesObj[scheme], securitySchemeName: scheme }));
      return name ? securitySchemes.find((scheme) => scheme.securitySchemeName === name) : securitySchemes;
    },
    getSecurityRequirementsByOperationId: function (operationId) {
      const requestInfo = this.getRequestInfoByOperationId(operationId);
      if (requestInfo && requestInfo.operation.security) {
        return requestInfo.operation.security.map(security => Object.keys(security)).flat();
      }
      return null;
    },
    mapToObject: function (map) {
      return JSON.parse(JSON.stringify(map));
    },
    isJWT: function (token) {
      const parts = token.split('.');
      return parts.length === 3;
    },
    validateJWT: function (token) {
      if (!this.isJWT(token)) {
        return false;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload && payload.exp && payload.exp > Date.now() / 1000;
      } catch (error) {
        return false;
      }
    },
    getValueByPath: function (root, path) {
      return path.split('.').reduce((acc, segment) => acc && acc[segment], root);
    },
    waitForSelector: function (selector, callback) {
      const seen = new WeakSet();

      const observer = new MutationObserver(() => {
        document.querySelectorAll(selector).forEach((element) => {
          if (!seen.has(element)) {
            seen.add(element);
            callback(element);
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    },
    preAuthorize: async function (params) {
      try {
        const API = this.getAPI();
        const operationId = params[0].operationId;
        const securityRequirements = this.getSecurityRequirementsByOperationId(operationId);

        for (const securityRequirement of securityRequirements) {
          const securityScheme = this.getSecuritySchemes(securityRequirement);

          // Check if the operation requires authentication
          if (securityScheme.scheme === 'bearer') {

            // Check if request is already authorized
            const currentAuthorization = params[0].securities.authorized && params[0].securities.authorized[securityRequirement];
            if (currentAuthorization && this.isJWT(currentAuthorization.value) && this.validateJWT(currentAuthorization.value)) return params;

            const authorizations = this.getSavedAuthorizations();

            if (!authorizations.length) return params;

            // Get the profile
            const authorization = authorizations.find(profile => profile.securitySchemeName === securityRequirement && profile.current);
            if (authorization) {

              const authRequestInfo = this.getRequestInfoByOperationId(authorization.parameters.operation_id);

              // Get the parameters
              const authRequestParams = authorization.parameters;

              const prebuildRequest = window.ui.getSystem().fn.buildRequest({
                spec: API,
                operationId: authRequestInfo.operation.operationId,
                parameters: { ...authRequestParams.parameters, ...authRequestParams.query },
                securities: { authorized: this.mapToObject(window.ui.getSystem().authSelectors.authorized()) },
                bodyParams: authRequestParams.body,
              });

              // Execute the request
              const response = await window.ui.getSystem().fn.fetch({
                ...prebuildRequest,
                headers: {
                  'Content-Type': 'application/json',
                  ...prebuildRequest.headers,
                  ...authRequestParams.headers
                },
                parameters: authRequestParams.parameters,
                ...(authRequestInfo.method === 'get' ? {} : { body: JSON.stringify(authRequestParams.body || {}) }),
              });

              const token = this.getValueByPath(response, authorization.auth_value_source.replace(/^response\./, ''));
              ui.preauthorizeApiKey(securityRequirement, token);
              const authorizedMap = window.ui.getSystem().authSelectors.authorized();

              const authorized = this.mapToObject(authorizedMap);

              const localStorageAuthorized = localStorage.getItem('authorized');
              if (!localStorageAuthorized) {
                localStorage.setItem('authorized', JSON.stringify(authorized));
              } else {
                const localStorageAuthorizedMap = JSON.parse(localStorageAuthorized);
                localStorage.setItem('authorized', JSON.stringify({ ...localStorageAuthorizedMap, ...authorized }));
              }

              params[0].securities.authorized = authorized;
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }

      return params;

    },
    getSavedAuthorizations: function () {
      const authorizations = JSON.parse(window.localStorage.getItem('swagger-ui-authorizations')) || [];
      this.authorizations = authorizations;
      return authorizations;
    },
    saveAuthorization: function (authorization) {
      if (authorization.id) {
        const index = this.authorizations.findIndex((auth) => auth.id === authorization.id);
        if (index > -1) this.authorizations[index] = authorization;
      } else {
        this.authorizations.push({ id: new Date().getTime().toString(), ...authorization });
      }
      window.localStorage.setItem('swagger-ui-authorizations', JSON.stringify(this.authorizations));
    },
    removeAuthorization: function (id) {
      this.authorizations = this.authorizations.filter((auth) => auth.id !== id);
      window.localStorage.setItem('swagger-ui-authorizations', JSON.stringify(this.authorizations));
    },
    getTextAsset: async function (path) {
      if (this.assetsCache[path]) {
        while (this.assetsCache[path].status === 'loading') await this.delay(5);
        return this.assetsCache[path].value;
      }
      this.assetsCache[path] = { value: null, status: 'loading' };
      const url = chrome.runtime.getURL(path);
      const raw = await fetch(url);
      const response = await raw.text();
      this.assetsCache[path] = { value: response, status: 'loaded' };
      return response;
    },
  }
})();
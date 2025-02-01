# Swagger UI Authorizer
[![GitHub license](https://img.shields.io/github/license/rodewitsch/swagger-ui-authorizer)](https://github.com/rodewitsch/swagger-ui-authorizer/blob/master/LICENSE)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/hhdgdnjkmkhedanhlidcmahodmakepfa?label=chrome%20web%20store%20users)
![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/hhdgdnjkmkhedanhlidcmahodmakepfa?label=chrome%20web%20store%20rating)

Browser extension that performs automatic authorization of requests before executing them on Swagger UI pages. Enables only when web page contains #swagger-ui selector (refresh Swagger UI web page after extension installation to turn it on)

You can create multiple authorization profiles and change them as needed.

The extension also allows you to see the value of the current authorization tokens.

Currently works only with OpenAPI 3.x.

Maintains:
 - bearer authorization via request and static token
 - api key authorization 
 - http basic authorization

Future features:
 - syncing profiles between devices
 - quick access to authorization profiles using hot keys or floating button or selector in default authorization modal (haven't decided yet)

Extension keeps your authorization data only in your browser and sends it only to your servers. I don't need it at all, I have things to do without your passwords.

If you think this extension might be useful to you, but it doesn't work in your case, write to me, maybe I can help.

If this extension is useful to you, please leave a few kind words in the review, it will be a good payment for me. 👉👈
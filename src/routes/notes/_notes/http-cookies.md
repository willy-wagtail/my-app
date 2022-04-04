---
author: William Cheung
authorImage: william.jpg
date: 2022-04-04
description: Here, I jotted down some notes on HTTP cookies as I was revisiting it on MDN.
slug: http-cookies
title: HTTP Cookies
---

A HTTP cookie is a small piece of data sent from a server to a user's web browser. As the HTTP protocol itself is stateless, cookies are typically used for remembering state for session management, personalisation, or tracking.

## Creating cookies

A server can respond to a HTTP request with one or more [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) headers, e.g.:

```
HTTP/2.0 200 OK
Content-Type: text/html
Set-Cookie: first_name=harry
Set-Cookie: last_name=potter
```

The browser will store the cookie and send it with subsequent requests to the same server inside a `Cookie` HTTP header. As cookies could be sent with every request, they can worsen performance.

```
GET /sample_page.html HTTP/2.0
Host: www.example.org
Cookie: first_name=harry; last_name=potter
```

## Cookie attributes

```
Set-Cookie: id=a3fWa; Expires=Thu, 31 Oct 2021 07:28:00 GMT; Secure; HttpOnly; Path=/notes; SameSite=Strict
```

_Session cookies_ are deleted when the current session ends. The browser defines when the current session ends (such as logging out or closing the browser). Browsers may restore sessions when restarting causing session cookies to last indefinitely.

_Permanent cookies_ are deleted at a date specified by the `Expires` attribute, or after a period of time by the `Max-Age` attribute.

A cookie with the `Secure` attribute is only sent to the server over HTTPS protocol: it is not sent over HTTP (except on localhost). Sites accessed via HTTP cannot set cookies marked as `Secure`. This helps mitigate [man-in-the-middle](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#man-in-the-middle_mitm) attacks.

A cookie with the `HttpOnly` attribute cannot be accessed using the Javascript [`Document.cookie` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) . This helps mitigate [XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#cross-site_scripting_xss) attacks.

The `Domain` attribute specifies which host can receive a cookie. If specified, then all subdomains are included. If unspecified, the default is the same host that set the cookie, _excluding subdomains_.

The `Path` attribute requires a URL path in the request in order to send the cookie. Subdirectories are also matched.

The `SameSite` attribute lets servers specify if and when cookies are sent with cross-site requests. If `SameSite=Strict`, then the cookie is only sent to the site it originated. If `SameSite=Lax`, then the cookie is sent when the user navigates to the cookie's origin site. If `SameSite=None` _and_ the `Secure` attribute is also present, then cookies are sent on both originating and cross-site requests. The default is `Lax`.

_Note that cookies from the same domain are not considered to be from the same site if sent using a different scheme - i.e. http or https._

## Cookie prefixes

`__Host-` prefix is accepted in a `Set-Cookie` header only if it's `Secure`, was sent from a secure origin, does _not_ include a `Domain` attribute, and has `Path=/`. These cookies are domain-locked to the origin and prevents [session fixation](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#session_fixation) attacks.

`__Secure-` prefix is accepted in a `Set-Cookie` header only if it's `Secure`, and was sent from the same origin.

## Security

Information in cookies are visible and can be changed by the end user. If this is an issue, consider using opague identifiers or other authentication mechanisms such as JSON Web Tokens.

If your site authenticates users, it should regenerate and resend session cookies, even ones that already exist, whenever a user authenticates. This approach helps prevent [session fixation](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#session_fixation) attacks, where a third party can reuse a user's session.

Use the `HttpOnly` attribute to prevent access using Javascript.

Cookies that contain sensitive information should have a short lifespan and should have `SameSite=Strict` or `SameSite=Lax` to prevent cross-site requests.

## Third-party cookies

A _first-party cookie_ is a cookie whose scheme (http or https) and domain (as well as subdomain if the `Domain` attribute was set) matches the current page. Otherwise it is a _third-party cookie_.

A webpage can use images or components stored on servers in other domains (such as ad-banners) which may set third-party cookies. These are typically for advertising and tracking purposes.

## Regulations

Regulations that cover the use of cookies include: the General Data Privacy Regulation (GDPR) in the EU, the ePrivacy Directive in the EU, and the California Consumer Privacy Act.

These regulations include requirements such as:

- Notifying users that your site uses cookies.
- Allowing users to opt out of receiving some or all cookies.
- Allowing users to use the bulk of your service without receiving cookies.

There are companies that offer "cookie banner" code that helps you comply with these regulations - though to the detriment of user experience.

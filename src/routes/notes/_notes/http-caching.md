---
author: William Cheung
authorImage: william.jpg
date: 2022-04-06
description: Here, I jotted down some notes on HTTP caching as I was revisiting it on MDN.
slug: http-caching
title: HTTP Caching
---

The first time a browser loads a web page and related resources, it stores these resources in its HTTP cache, also known as browser cache.

All HTTP requests that the browser makes first goes to the browser cache to check whether a valid cached response is present for it to use instead of making a network query.

## Cache-Control header

The [`Cache-Control` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) is how you specify HTTP caching instructions for both HTTP requests and responses.

The `no-store` directive means the cache will not store anything about the request or response.

The `no-cache` directive will force a request to be sent to the origin server to revalidate the cache before it can be used.

The `max-age=<seconds>` directive specifies the maximum amount of time an item is still considered _fresh_, measured from the time the response was generated on the origin server (the `Age: <seconds>` HTTP header can be used to tell the browser cache to deduct seconds from it's freshness). If set, the `Expires` HTTP header is ignored. This is best used for files that rarely change.

The `must-revalidate` directive means the cached response can be used if still _fresh_, but must be re-validated if _stale_. An item is stale if the max-age has passed. This means this directive is commonly used with the `max-age` directive. However, stale items are allowed to be used if the origin server is disconnected.

The `Pragma: no-cache` HTTP header is an HTTP/1.0 header that means the same as `Cache-Control: no-cache`. It is only used for backwards compatibility with HTTP/1.0 caches, since `Cache-Control` is a HTTP/1.1 header. However, `Pragma` is only used on HTTP requests, so cannot reliably replace `Cache-Control`.

### Private v shared

```
Cache-Control: private
Cache-Control: public
```

The `public` directive means the response may be cached by any cache. Responses to requests with an `Authorisation` HTTP header fields are not stored in a shared cache - but this would override it.

The `private` directive means that the response is for a single user only and can only be stored in a private browser cache.

## Freshness

Caches have finite storage space so items are periodically removed in a process called _cache eviction_.

Items in the cache may no longer match that on the server so will need updating. This is done by the server using an expiration time before which the item is _fresh_ and after which the item is _stale_.

If an item in the cache is _stale_ when accessed, it'll make an _HTTP conditional request_ to the server with an `If-None-Match` HTTP header to check whether it is still fresh. If it is still fresh, the server will return a `304 Not Modified` response without a body. This will refresh the age and return the cached item.

### Freshness lifetime

A response's [_freshness lifetime_](https://httpwg.org/specs/rfc7234.html#calculating.freshness.lifetime) is the length of time between it's generation on the server and the expiration time.

It is calculated as follows:

1.  If the cache is shared and with HTTP header `Cache-Control: s-maxage=N`, the freshness lifetime is N.
2.  If `Cache-Control: max-age=N` HTTP header is present, the freshness lifetime is N.
3.  If an `Expires` HTTP header is present, the freshness lifetime is its value minus the `Date` HTTP header value.
4.  Otherwise, no explicit expiration time is present in the response. A _heuristic freshness lifetime_ might be applicable.

    - If `Last-Modified` header exists, then the freshness lifetime is the `Date` header minus the value of the `Last-Modified` header divided by 10.

## Revved resources

This is a technique for updating the cache of files which are changed infrequently, such as Javascript or CSS files.

A revision, version, hash or date is added to the filename in the URL. Each update of the file is then considered a new resource. To get the new files, the links to these files must be updated.

So we could, for example, have the HTML file have a short cache expiration so that it revalidates often, but the CSS and Javascript files which are versioned do not need to expire. When the CSS filename changes, the HTML will update to link to it, and it will be picked up when the current cached HTML goes stale.

## Cache validation

When a request is made to a stale resource, it is either validated or fetched again.

Revalidation is triggered when user reloads the page or if a cached response includes the `Cache-Control: must-revalidate` header. Validation can only occur if the server provides a _strong validator_ or a _weak validator_.

### ETags

The `ETag`, or entity tag, is a HTTP response header that is a value that can be used as a strong validator. The client can then issue a `If-None-Match` HTTP header in future requests to validate the cached resource.

The server compares value the client sent with the `ETag` for its current version of the resource, and if both values match, the server sends back a `304 Not Modified` status without a body. This tells the client the cached version is still fresh.

### Last-Modified

The `Last-Modified` HTTP header can be used as a weak validator because it is only accurate to 1 second. It is used as a fallback to the `Etag`.

If the `Last-Modified` header is present in a response, then the client can issue an `If-Modified-Since` request header to validate the cached document. The server can either ignore it and respond with a normal `200 OK`, or it can return `304 Not Modified` with an empty body.

## Vary

The `Vary` HTTP response header specifies how to go about matching cached entries.

This is comonly used to allow a resource to be cached in uncompressed and various compressed formats, and served based on the encodings they support. For example, the response could have:

```
HTTP/1.1 200 OK
Content-Encoding: gzip
Vary: Accept-Encoding
```

The cache will save this with the URL and Content-Encoding (i.e.gzip) as key. This means separate versions are cached for all requests that specify support for a particular set of encodings. For example, the following will be forwarded to the server as the cache will only have gzip:

```
Get /doc HTTP/1.1
Accept-Encoding: br
```

The `Vary` header can be used to serve different content for desktop and mobile users by using `Vary: User-Agent` header because they have different `User-Agent` values.

### Normalisation

A caching server should use _normalization_ to reduce duplicated cache entries and unnecessary requests to the origin server. This reduces the effectiveness of caching. Particularly when using `Vary` headers and values that have many slight variations.

For example, by default, all of the following results in a separate request to the origin and a separate cache entry: `Accept-Encoding: gzip,deflate,sdch`, `Accept-Encoding: gzip,deflate`, `Accept-Encoding: gzip`. Here, you could just use `gzip` and remove everything else before further processing.

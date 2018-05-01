## :warning: WARNING :warning: 

This library is deprecated and no longer maintained. It's dependencies are out-of-date and the codebase has known security vulnerabilities. 

## Setup

`npm install mixcloud`

A work-in-progress Mixcloud API Client. We welcome pull requests to implement 
additional features.

## Features

At present, features in this client are being developed as to that which NTSLive.co.uk (the project sponsor) are requiring. At present, 
those features are:

- [x] Fetching a given users cloudcasts (`GET /<user>/cloudcasts`)
- [x] Fetching a given cloudcasts (`GET /<user>/<cloudcast_key>`)
- [ ] Editing a cloudcast (http://www.mixcloud.com/developers/#editing)
- [ ] Uploading a cloudcast (http://www.mixcloud.com/developers/#uploads)

## Usage

```
var mixcloud = require('mixcloud');
```

All methods throw either an Error in the case of bad options, or, return a promise that is either resolved or rejected.

### Pagination Objects

A pagination object is an object with two methods `next` and `previous`, these 
can be null if it is not possible to paginate past the current point. Calling 
either `next` or `previous` will result in a new response Promise.

### Rate Limits

In the case that Mixcloud rate limit your access, the promise will be rejected with an `Error` object with the following setup:

```
  {
    name: "RateLimited",
    message: "<some rate limit message>",
    payload: {
      retry_after: <number of seconds>,
      retry: Function
    }
  }
```

For example, to handle errors, you might write some code that looks like:

```
  mixcloud.cloudcasts('ntsradio').then(handleSuccess, handleError);

  function handleError(error) {
    if(error.name === "RateLimited"){
      setTimeout(function(){
        error.payload.retry().then(handleSuccess, handleError);
      }, error.payload.retry_after * 1000);

      return;
    }

    // Handle other errors
  }
}
```

### Fetch the cloudcasts for a user

```
// Fetch ntsradio's cloudcasts with the default limits and pagination
promise = mixcloud.cloudcasts('ntsradio')

// Fetch ntsradio's cloudcasts, but limit to 100 results per page (maximum)
promise = mixcloud.cloudcasts('ntsradio', { limit: 100 })

// Fetch ntsradio's cloudcasts since a given date (July 1st at midnight)
promise = mixcloud.cloudcasts('ntsradio', { since: new Date(2014, 06, 01, 00, 00, 00) })

// Fetch ntsradio's cloudcasts until a given date
promise = mixcloud.cloudcasts('ntsradio', { until: new Date(2014, 06, 01, 00, 00, 00) })
```

In the above `promise` should resolve to an object where the results are on the 
`results` key, with a Pagination Object at the `pagination` key.

### Fetch an individual cloudcast

```
promise = mixcloud.cloudcast('/NTSRadio/knee-deep-26th-august-2014/')

// OR

promise = mixcloud.cloudcast('NTSRadio', 'knee-deep-26th-august-2014')
```

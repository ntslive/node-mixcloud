# `npm install mixcloud`

A work-in-progress Mixcloud API Client. We welcome pull requests to implement 
additional features. We plan to support:

- Fetching a given users cloudcasts (`GET /<user>/cloudcasts`)
- Fetching a given cloudcasts (`GET /<user>/<cloudcast_key>`)
- Editing a cloudcast (http://www.mixcloud.com/developers/#editing)
- Uploading a cloudcast (http://www.mixcloud.com/developers/#uploads)

At present, only the first item is implemented.

## Usage

```
var mixcloud = require('mixcloud');
```

### Pagination Objects

A pagination object is an object with two methods `next` and `previous`, these 
can be null if it is not possible to paginate past the current point. Calling 
either `next` or `previous` will result in a new response Promise.

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

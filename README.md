# Real-time Tweet Stream
Get real-time tweets and display on webpage with socket.io

## Usage
Go to https://developers.twitter.com portal and get a bearer token and add it to the .env file

```
npm install

npm start
```

## Error
Sudah mengupdate bearer token namun masih mendapatkan error :

Client connected...
{
  client_id: '28296095',
  detail: 'When authenticating requests to the Twitter API v2 endpoints, you must use keys and tokens from a Twitter developer App that is attached to a Project. You can create a project via the developer portal.',
  registration_url: 'https://developer.twitter.com/en/docs/projects/overview',
  title: 'Client Forbidden',
  required_enrollment: 'Appropriate Level of API Access',
  reason: 'client-not-enrolled',
  type: 'https://api.twitter.com/2/problems/client-forbidden'
}

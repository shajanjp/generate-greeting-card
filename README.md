# Greeting Card Generator


## Start Server 
```sh
deno run --allow-run --allow-read --allow-write --allow-net server.ts
```

## Curl Request
```sh
curl --request POST \
  --url http://localhost:8000/api/greetings \
  --header 'content-type: application/json' \
  --data '{
  "name": "Emi"
}
'
```

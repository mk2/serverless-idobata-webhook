# serverless-idobata-webhook

- A plugin for serverless.
- Can send notification to arbitrary idobata webhook at start/finish deploying.

# How to use

1. Add this plugin.

```sh
yarn add -D serverless-idobata-webhook
```

2. Setup custom in `serverless.yml`

```yml
custom:
  serverless-idobata-webhook:
    webhookUrl: https://idobata.io/hook/custom/...
    # if you want to modify notification messges, set two properties.
    # Messges are formatted by pupa (https://github.com/sindresorhus/pupa) with some pre-defined variables by this plugin.
    beforeDeployMessage: 'ok, {username} started deploying.'
    afterDeployMessage: 'ok, {username} finished deploying.'
```

---

#### Available pre-defined variables in deploy messages:

These pre-defined variables can be used by pupa format. In example, `{username}` will be `MyPcUser`.

- `username`: Your account name of the machine.
- `hostname`: Your machines's hostname.
- `ipAddress`: Your ip address of the machine.
- `currentTime`: Current date formatted by `yyyy-MM-dd HH:mm:ss`

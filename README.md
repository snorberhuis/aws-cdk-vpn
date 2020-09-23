# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Setting up the Server CA.
Reference: https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/client-authentication.html#mutual

1. Create a CA
```
cd easy-rsa/easyrsa3.
./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa build-server-full server nopass

aws acm import-certificate --certificate fileb://pki/issued/server.crt --private-key fileb://pki/private/server.key --certificate-chain fileb://pki/ca.crt 
```

The CA certificate is now ready.

1. Create client certficates.

```
./easyrsa build-client-full client1.domain.tld nopass
aws acm import-certificate --certificate fileb://pki/issued/client1.domain.tld.crt --private-key fileb://pki/private/client1.domain.tld.key --certificate-chain fileb://pki/ca.crt
```

## Generating client certificates.

1. Go into AWS Console VPN:

```
https://console.aws.amazon.com/vpc/home?#ClientVPNEndpoints
```

1. Download the configuration using the button.

1. Add the certificate of the client to the configuration. 
You can find the certificate in `easy-sra/easyrsa3/pki/issued/client1.domain.tld.crt`.

```
<cert>
Certificate:
   ....
-----END CERTIFICATE-----
</ca>
```

1. Add the private key to the configuration.
You can find the certificate in `easy-sra/easyrsa3/pki/private/client1.domain.tld.key`
```
<key>
-----BEGIN PRIVATE KEY-----
    ...
-----END PRIVATE KEY-----
</key>
```

1. You can now use the configuration!
To create more clients, you can generate more clients in `easyrsa`
and change the certificate and key in the file.

## Revoking Client Certificates
Reference: https://aws.amazon.com/premiumsupport/knowledge-center/client-vpn-revoke-access-specific-client/

To revoke a client, you have to generate a new certificate revocation list(CRL) and upload this to ACM.

1. Revoke the client.
```
./easyrsa revoke <client_certificate_name>
```

1. Generate the CRL.
```
./easyrsa gen-crl
```

1. Now you can upload the CRL to the AWS VPN.

```
easyrsa/easyrsa3/crl.pem
```

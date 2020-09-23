# AWS CDK VPN

This is project that provides a way to deploy an AWS VPN to your VPC.
It uses CDK to deploy the AWS VPN and (easyrsa)[https://github.com/OpenVPN/easy-rsa] to administer the clients.
Easy RSA is the recommended way to do mutual authentication for VPN by AWS.

AWS VPN is great to provide devops access to private subnets without exposing it to the internet.
For example, access to EC2 machines or a RDS database.

This project contains a submodule to easyrsa so checkout the project with:

```
git clone --recurse-submodules https://github.com/snorberhuis/aws-cdk-vpn.git
```

You can see an example of implementation in `bin/example.ts`.

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

```
./easyrsa build-client-full client2.domain.tld nopass
```

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

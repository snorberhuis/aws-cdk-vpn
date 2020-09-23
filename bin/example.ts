import cdk = require('@aws-cdk/core');

import {VpnStack} from '../lib/vpn';

const app = new cdk.App();


interface SomeCompanyProps {
    vpnServerCertificateArn: string,
    vpnClientCertificateArn: string,

    vpcName: string

    stackProps?: cdk.StackProps
}

export class SomeCompany {

    clientCidrBlock = '10.2.0.0/16'

    constructor(app: cdk.App, props: SomeCompanyProps) {
        new VpnStack(app, 'Vpn', {
            serverCertificateArn: props.vpnServerCertificateArn,
            clientCertificateArn: props.vpnClientCertificateArn,

            clientCidrBlock: this.clientCidrBlock,
            vpcName: "vpc-caliber",

            stackProps: props.stackProps
        })

    }

}

new SomeCompany(app, {
    vpnServerCertificateArn: "<vpn server cert arn>",
    vpnClientCertificateArn: "<vpn client cert arn>",

    vpcName: "some-company-vpc",

    stackProps: {
        env: {
            account: '<account number>',
            region: 'eu-west-1'
        }
    }
});


app.synth();

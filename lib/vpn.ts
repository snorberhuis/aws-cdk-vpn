import cdk = require('@aws-cdk/core');

import ec2 = require("@aws-cdk/aws-ec2");


import { CfnClientVpnTargetNetworkAssociation, CfnClientVpnEndpoint, CfnClientVpnAuthorizationRule} from '@aws-cdk/aws-ec2'
import certificateManager =require('@aws-cdk/aws-certificatemanager');
import * as  logs from '@aws-cdk/aws-logs';


export interface VpnProps {
    /**
     * Route all traffic through the VPN. True will not route traffic through the VPN.
     *
     * @default - true
     */

    serverCertificateArn: string
    clientCertificateArn: string

    clientCidrBlock: string
    vpcName?: string

    stackProps?: cdk.StackProps
}

/**
 * VpnStack deploys an AWS VPN to an account
 */
export class VpnStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: VpnProps) {
        super(scope, id, props.stackProps);

        const clientCert = certificateManager.Certificate.fromCertificateArn(
            this,
            'ClientCertificate',
            props.clientCertificateArn
        );
        const serverCert = certificateManager.Certificate.fromCertificateArn(
            this,
            'ServerCertificate',
            props.serverCertificateArn
        );

        const logGroup = new logs.LogGroup(this, 'ClientVpnLogGroup', {
            retention: logs.RetentionDays.ONE_MONTH
        });

        const logStream = logGroup.addStream('ClientVpnLogStream');

        const endpoint = new CfnClientVpnEndpoint(this, 'ClientVpnEndpoint2', {
            authenticationOptions: [{
                type: "certificate-authentication",
                mutualAuthentication: {
                    clientRootCertificateChainArn: clientCert.certificateArn
                }
            }],
            tagSpecifications: [{
                resourceType: "client-vpn-endpoint",
                tags: [{
                    key: "Name",
                    value: "VPN"
                }]
            }],
            clientCidrBlock:  props.clientCidrBlock,
            connectionLogOptions: {
                enabled: true,
                cloudwatchLogGroup: logGroup.logGroupName,
                cloudwatchLogStream: logStream.logStreamName
            },
            serverCertificateArn: serverCert.certificateArn,
            splitTunnel: true,
            dnsServers: ["8.8.8.8", "8.8.4.4"],
        });

        let i = 0;
        const dependables = new cdk.ConcreteDependable();

        const vpc = ec2.Vpc.fromLookup(this, "vpc", {
            vpcName: props.vpcName,
            isDefault: (!props.vpcName),
        })

        vpc.privateSubnets.map(subnet => {
            let networkAsc = new CfnClientVpnTargetNetworkAssociation(this, 'ClientVpnNetworkAssociation-' + i, {
                clientVpnEndpointId: endpoint.ref,
                subnetId: subnet.subnetId
            });
            dependables.add(networkAsc);
            i++;
        });

        new CfnClientVpnAuthorizationRule(this, 'ClientVpnAuthRule', {
            clientVpnEndpointId: endpoint.ref,
            targetNetworkCidr: "0.0.0.0/0",
            authorizeAllGroups: true,
            description: "Allow all"
        });


    }
}

import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_route53 as route53,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { RemoteParameters } from "cdk-remote-stack";

interface HostedZoneStackProps extends StackProps {
  vpcStackParams: {
    path: string;
    region: string;
  }[];
  vpcIds: string[];
}

export class HostedZoneStack extends Stack {
  constructor(scope: Construct, id: string, props: HostedZoneStackProps) {
    super(scope, id, props);

    const vpcStackValues = props.vpcStackParams.map((vpcStackParam, index) => {
      const parameters = new RemoteParameters(
        this,
        `${vpcStackParam.region}Parameters`,
        {
          path: vpcStackParam.path,
          region: vpcStackParam.region,
        }
      );

      const vpcId = parameters.get(`${vpcStackParam.region}/vpcId`);
      const ec2InstancePublicIp = parameters.get(
        `${vpcStackParam.region}/ec2InstancePublicIp`
      );

      return {
        vpcId,
        ec2InstancePublicIp,
      };
    });

    const privateHostedZone = new route53.PrivateHostedZone(
      this,
      "PrivateHostedZone",
      {
        zoneName: "corp.non-97.net",
        vpc: ec2.Vpc.fromLookup(this, "vpc1", {
          vpcId: vpcStackValues[0].vpcId,
        }),
      }
    );

    props.vpcIds.forEach((vpcId, index) => {
      if (index !== 0) {
        privateHostedZone.addVpc(
          ec2.Vpc.fromLookup(this, `vpc${index + 1}`, {
            vpcId,
            region: props.vpcStackParams[index].region,
          })
        );
      }
    });

    vpcStackValues.forEach((vpcStackValue, index) => {
      new route53.ARecord(this, `ARecord${index}`, {
        zone: privateHostedZone,
        target: route53.RecordTarget.fromIpAddresses(
          vpcStackValue.ec2InstancePublicIp
        ),
      });
    });
  }
}

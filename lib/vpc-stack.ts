import { aws_iam as iam, aws_ec2 as ec2, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class VpcStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly ec2Instance: ec2.IInstance;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // SSM IAM role
    const ssmIamRole = new iam.Role(this, "SsmIamRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    // VPC
    this.vpc = new ec2.Vpc(this, "Vpc", {
      cidr: "10.0.0.0/27",
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 1,
      subnetConfiguration: [
        { name: "Public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 27 },
      ],
    });

    // EC2 Instance
    this.ec2Instance = new ec2.Instance(this, `Ec2Instance`, {
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      instanceType: new ec2.InstanceType("t3.micro"),
      vpc: this.vpc,
      role: ssmIamRole,
    });
  }
}

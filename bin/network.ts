#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/vpc-stack";
import { HostedZoneStack } from "../lib/hosted-zone-stack";

const app = new cdk.App();

const envJP = {
  region: "ap-northeast-1",
  account: process.env.CDK_DEFAULT_ACCOUNT,
};
const envUS = { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT };
const stackName = "VpcStack";

const vpcStackUS = new VpcStack(app, "VpcStackUS", {
  env: envUS,
  stackName,
});

const vpcStackJP = new VpcStack(app, "VpcStackJP", {
  env: envJP,
  stackName,
});

const parameterPathJP = `/${envJP.account}/${envJP.region}/${stackName}`;
const parameterPathUS = `/${envUS.account}/${envUS.region}/${stackName}`;

new cdk.aws_ssm.StringParameter(vpcStackJP, "vpcId", {
  parameterName: `${parameterPathJP}/vpcId`,
  stringValue: vpcStackJP.vpc.vpcId,
});
new cdk.aws_ssm.StringParameter(vpcStackJP, "ec2InstancePublicIp", {
  parameterName: `${parameterPathJP}/ec2InstancePublicIp`,
  stringValue: vpcStackJP.ec2Instance.instancePublicIp,
});

new cdk.aws_ssm.StringParameter(vpcStackUS, "vpcId", {
  parameterName: `${parameterPathUS}/vpcId`,
  stringValue: vpcStackUS.vpc.vpcId,
});
new cdk.aws_ssm.StringParameter(vpcStackUS, "ec2InstancePublicIp", {
  parameterName: `${parameterPathUS}/ec2InstancePublicIp`,
  stringValue: vpcStackUS.ec2Instance.instancePublicIp,
});

// const hostedZoneStack = new HostedZoneStack(app, "HostedZoneStack", {
//   env: envUS,
//   vpcStackParams: [
//     { path: parameterPathUS, region: envUS.region },
//     { path: parameterPathJP, region: envJP.region },
//   ],
//   vpcIds: ["vpc-xxxx", "vpc-xxxx"],
// });

// hostedZoneStack.addDependency(vpcStackUS);
// hostedZoneStack.addDependency(vpcStackJP);

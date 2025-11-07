import * as aws from "@pulumi/aws";

//  Create a VPC
const vpc = new aws.ec2.Vpc("pulumi-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "PulumiVPC",
    },
});

// Create a Subnet
const subnet = new aws.ec2.Subnet("pulumi-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "us-east-1a",
    tags: {
        Name: "PulumiSubnet",
    },
});

// Create a Security Group
const sg = new aws.ec2.SecurityGroup("pulumi-sg", {
    vpcId: vpc.id,
    description: "Allow SSH and HTTP",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "PulumiSecurityGroup",
    },
});

// Create an EC2 Instance
const ami = aws.ec2.getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [
        { name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] },
    ],
});

const ec2 = new aws.ec2.Instance("pulumi-ec2", {
    instanceType: "t3.micro",
    ami: ami.then(a => a.id),
    subnetId: subnet.id,
    vpcSecurityGroupIds: [sg.id],
    associatePublicIpAddress: true,
    tags: {
        Name: "PulumiEC2",
    },
});

//  Create an S3 Bucket
const bucket = new aws.s3.Bucket("pulumi-bucket", {
    acl: "private",
    tags: {
        Environment: "Dev",
        Project: "PulumiInfra",
    },
});

export const vpcId = vpc.id;
export const subnetId = subnet.id;
export const ec2PublicIp = ec2.publicIp;
export const bucketName = bucket.id;

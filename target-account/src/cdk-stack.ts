/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as core from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

/**
 * Custom properties to accomodate list of code deployment buckets across different regions
 */
interface EnvProps extends core.StackProps{
  toolsAccountUserArn: string;
}

export class CrossAccountRolesStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: EnvProps) {
    super(scope, id, props);

    // Create Cloudformation Execution Role
    const cfExecutionRole = new iam.Role(
      this,
      'GitActionsCFExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
        description: 'Role assumed by cloudformation service while creating the required resources',
        roleName: 'git-action-cf-execution-role',
        inlinePolicies: {
          CFExecutionPolicy: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                actions: [
                  'iam:Get*',
                  'iam:List*',
                  'iam:*Role*',
                  'iam:CreatePolicy',
                  'iam:DeletePolicy',
                  'iam:*PolicyVersion*',
                  'iam:*InstanceProfile*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  's3:Get*',
                  's3:List*',
                  's3:HeadBucket'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  'cloudformation:*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  'apigateway:*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  'lambda:*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              })
            ]
          })
        }
      }
    )

    // Create a cross account role
    const crossAccountRole = new iam.Role(
      this,
      'CrossAccountRole',
      {
        assumedBy: new iam.ArnPrincipal(String(props?.toolsAccountUserArn)),
        description: 'Cross account role to be assumed by Raven tools account. Used for CICD deployments only.',
        roleName: 'git-action-cross-account-role',
        inlinePolicies: {
          CrossAccountPolicy: new iam.PolicyDocument({
            assignSids: true,
            statements: [
              new iam.PolicyStatement({
                actions: [
                  'iam:PassRole'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  cfExecutionRole.roleArn
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  's3:List*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  's3:*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  // This is staging bucket created by CDKToolkit stack when CDK app is bootstrapped
                  'arn:aws:s3:::cdktoolkit-stagingbucket-*',
                  'arn:aws:s3:::cdktoolkit-stagingbucket-*/*'
                ]
              }),
              new iam.PolicyStatement({
                actions: [
                  'cloudformation:*'
                ],
                effect: iam.Effect.ALLOW,
                resources: [
                  '*'
                ]
              })
            ]
          })
        }
      }
    );

    // STS Session Tagging Permission
    const sessionTaggingPolicy = new iam.PolicyStatement()
    sessionTaggingPolicy.addPrincipals(new iam.ArnPrincipal(String(props?.toolsAccountUserArn)));
    sessionTaggingPolicy.addActions('sts:TagSession');
    sessionTaggingPolicy.effect = iam.Effect.ALLOW;
    crossAccountRole.assumeRolePolicy?.addStatements(sessionTaggingPolicy)

    /*********************************** List of Outputs ************************************/
    new core.CfnOutput(
      this,
      'CFExecutionRoleArn',
      {
        description: 'Cloudformation Execution Role ARN',
        exportName: 'GIT-ACTIONS-CF-EXECUTION-ROLE-ARN',
        value: cfExecutionRole.roleArn
      }
    )

    new core.CfnOutput(
      this,
      'CrossAccountRoleArn',
      {
        description: 'Cross Account Role ARN',
        exportName: 'GIT-ACTIONS-CROSS-ACCOUNT-ROLE-ARN',
        value: crossAccountRole.roleArn
      }
    )
    /****************************************************************************************/
  }
}

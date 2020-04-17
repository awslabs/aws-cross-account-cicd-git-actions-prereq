# aws-cross-account-cicd-git-actions-prereq

## This project is prerequisite to [aws-cross-account-cicd-git-actions](https://github.com/awslabs/aws-cross-account-cicd-git-actions). It is to be deployed via CDK (Typescript).

## License
This library is licensed under the MIT-0 License. See the LICENSE file.

### System requirements
- [node (version >= 12x)](https://nodejs.org/en/download/)
- [jq](https://github.com/stedolan/jq/wiki/Installation)

### Project Structure
> Project has been structured such that there exist one stack under root folder `src/` that deploys cross account iam role and cloudformation execution iam role to the target AWS account.
>
>> `src/cdk-stack.ts` deploys cross account and cloudformation execution iam roles.
>> `src/cdk-stack-param.json` Defines parameters to be used in the stack. The only parameter currently is TOOLS_ACCOUNT_USER_ARN which defines the iam user arn that would be allowed to assume the cross account role. __In the arn replace `<tools-account-id>` with AWS account id of designated tools account.__
>> `assume-role-policy.json` is the policy document for the user to be created in the tools account so that the user has necessary permissions to assume cross account role. __Under resources of CrossAccountAssumeRole sid replace `<target-account-id>` with AWS account id of designated target deployment account.__
>>
>> The stack is part of `app.ts` which represents an cdk app.

### Deployment using CDK
> The project is to be deployed as a cdk app using `deploy.sh` script provided at the root of the project folder.
>
>> Script takes AWS profile name configured in `~/.aws/credentials` file as the only parameter. This AWS profile should pertain to the AWS account designated as the deployment target. It also needs to have necessary permissions to create Cloudformation stack and IAM roles.
>> Please note the Cloudformation exports `GIT-ACTIONS-CF-EXECUTION-ROLE-ARN` and `GIT-ACTIONS-CROSS-ACCOUNT-ROLE-ARN`. You will need them.
>> ***As a prerequisite to deployment please setup a profile for each AWS account to be designated as the deployment target***.

# aws-cross-account-cicd-git-actions-prereq

## This project is prerequisite to [aws-cross-account-cicd-git-actions](https://github.com/awslabs/aws-cross-account-cicd-git-actions). It is to be deployed via CDK (Typescript).

## License
This library is licensed under the MIT-0 License. See the LICENSE file.

### System requirements
- [node (version >= 12x)](https://nodejs.org/en/download/)
- [jq](https://github.com/stedolan/jq/wiki/Installation)

### Project Structure
> Project has been structured into two sections __target-account__ and __tools-account__. Each section has one stack under folder `src/` that deploys to an AWS account
> __tools-account__
>> The cdk stack here deploys IAM user to the tools AWS account. This IAM user is will be used by git action workflow to carry out deployment in target account
>> - `src/cdk-stack.ts` deploys IAM user and stores its secret in secret manager.
>> - `src/cdk-stack-param.json` Defines parameters to be used in the stack. The only parameter currently is TARGET_ACCOUNT_USER_ARN which defines the cross account iam role arn that the user would be allowed to assume when carrying out deployment. __In the arn replace `<target-account-id>` with AWS account id of designated deployment target account.__
>>
>> The stack is part of `app.ts` which represents an cdk app.

> __target-account__
>> The cdk stack here deploys cross account iam role and cloudformation execution iam role to the target AWS account.
>> - `src/cdk-stack.ts` deploys cross account and cloudformation execution iam roles.
>> - `src/cdk-stack-param.json` Defines parameters to be used in the stack. The only parameter currently is TOOLS_ACCOUNT_USER_ARN which defines the iam user arn that would be allowed to assume the cross account role. __In the arn replace `<tools-account-id>` with AWS account id of designated tools account.__
>>
>> The stack is part of `app.ts` which represents an cdk app.

### Deployment using CDK
> Both sections __target-account__ and __tools-account__ are to be deployed as a cdk app using `deploy.sh` script provided under their respective folder.
>
>> Script takes AWS profile name configured in `~/.aws/credentials` file as the only parameter. This AWS profile should pertain to the AWS account designated as the deployment target. It also needs to have necessary permissions to carry out their respective tasks.
>> For __target-account__ permissions are required to create Cloudformation stack and IAM roles. Cloudformation exports `GIT-ACTIONS-CF-EXECUTION-ROLE-ARN` and `GIT-ACTIONS-CROSS-ACCOUNT-ROLE-ARN`. You will need them.
>> For __tools-account__ permissions are required to create Cloudformation stack, IAM user and Secret Manager secret. Cloudformation exports `GIT-ACTIONS-DEPLOYMENT-USER-ACCESS-KEY` and `GIT-ACTIONS-DEPLOYMENT-USER-ARN`. You will need them.
>> 
>> ***As a prerequisite to deployment please setup a profile for the tools account and each AWS account to be designated as the deployment target***.

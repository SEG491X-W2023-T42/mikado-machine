# Development Process

Devs, please do not commit to the **main** branch!  All features are developed in feature branches. A feature can then be merged into master using a PR.

Please do your best to name branches using the following conventions:
 - `feature/issue-{number}` : use for application new features 
 - `bugfix/issue-{number}` : use for fixing application bugs / issues 

 examples :
 - feature/issue-15469
 - bugfix/issue-15469

 Developers should follow the following steps :
  - updated the `master` : `git pull origin master`
  - create feature branch : `git chekout -b feature/issue-15469`
  - develop the specified requirements
  - commit only changed files, in the commit optionally use # with issue number, ex. "#111" to link commit to issue
  - raise a Pull request
  - ask one of the pears for the review
  - address the required review comments
  - after the review squash-merge the PR

###  PR Checklist :
- code done as per the requirements. It should meet the acceptance criteria.
- unit tests done for all business components
- integration test done the specified REST APIs
- build is passing  


node {
  withEnv(["PATH+NODE=${tool name: 'latest', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'}/bin"]) {
    currentBuild.result = "SUCCESS"

    try {
      stage "Set Up"
        sh "curl -L http://nexus.riglet:9000/nexus/service/local/repositories/staging/content/zips/jenkins-pipeline-libraries/jenkins-pipeline-libraries-1.5.0.zip -o lib.zip && echo 'A' | unzip lib.zip"

        ecr = load "lib/ecr.groovy"
        git = load "lib/git.groovy"
        npm = load "lib/npm.groovy"
        shell = load "lib/shell.groovy"
        slack = load "lib/slack.groovy"

        def registry = "https://006393696278.dkr.ecr.us-west-2.amazonaws.com"
        def appUrl = "http://synapse.staging.buildit.tools"
        def appName = "synapse"
        def awsRegion = "us-west-2"
        def convoxRack = "convox.buildit.tools"
        def convoxPassword = "PqSKzNqXXbKuuJspbXZBUIRGSAtlER"

        // global for exception handling
        slackChannel = "midas_project"
        gitUrl = "https://bitbucket.org/digitalrigbitbucketteam/synapse"

      stage "Checkout"
        checkout scm

        // global for exception handling
        shortCommitHash = git.getShortCommit()
        def commitMessage = git.getCommitMessage()
        def version = npm.getVersion()

      stage "Install"
        sh "npm install"

      stage "Test"
        sh "npm run test"
        step([$class: 'JUnitResultArchiver', testResults: 'reports/test-results.xml'])
        publishHTML(target: [reportDir: 'reports', reportFiles: 'test-results.html', reportName: 'Test Results'])
        publishHTML(target: [reportDir: 'reports/coverage', reportFiles: 'index.html', reportName: 'Coverage Results'])

      stage "Analysis"
        sh "/usr/local/sonar-scanner-2.6.1/bin/sonar-scanner -e -Dsonar.projectVersion=${version}"

      stage "Build"
        sh "MODE=production npm run build"

      stage "Docker Image Build"
        def tag = "${version}-${shortCommitHash}-${env.BUILD_NUMBER}"
        def image = docker.build("${appName}:${tag}", '.')
        ecr.authenticate(awsRegion)

      stage "Docker Push"
        docker.withRegistry(registry) {
          image.push("${tag}")
        }

      stage "Deploy To AWS"
        sh "convox login ${convoxRack} --password ${convoxPassword}"
        sh "convox deploy --app ${appName}-staging --description '${tag}'"
        slack.notify("Deployed to Staging", "Commit <${gitUrl}/commits/\'${shortCommitHash}\'|\'${shortCommitHash}\'> has been deployed to <${appUrl}|${appUrl}>\n\n${commitMessage}", "good", "http://i296.photobucket.com/albums/mm200/kingzain/the_eye_of_sauron_by_stirzocular-d86f0oo_zpslnqbwhv2.png", slackChannel)

      stage "Run Functional Tests"
        // wait until the app is deployed
        // run Selenium tests

      stage "Promote Build to latest"
        docker.withRegistry(registry) {
          image.push("latest")
        }
    }
    catch (err) {
      currentBuild.result = "FAILURE"
      slack.notify("Error while deploying to Staging", "Commit <${gitUrl}/commits/\'${shortCommitHash}\'|\'${shortCommitHash}\'> failed to deploy.", "danger", "http://i296.photobucket.com/albums/mm200/kingzain/the_eye_of_sauron_by_stirzocular-d86f0oo_zpslnqbwhv2.png", slackChannel)
      throw err
    }
  }
}
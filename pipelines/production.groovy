// Production release pipeline

node {

  currentBuild.result = "SUCCESS"

  try {

    stage "Set Up"
      checkout scm

      sh "curl -L http://nexus.riglet:9000/nexus/service/local/repositories/staging/content/zips/jenkins-pipeline-libraries/jenkins-pipeline-libraries-1.5.0.zip -o lib.zip && echo 'A' | unzip lib.zip"

      ui = load "lib/ui.groovy"
      ecr = load "lib/ecr.groovy"
      slack = load "lib/slack.groovy"
      template = load "lib/template.groovy"

      def appName = "synapse"
      def awsRegion = "us-west-2"
      def convoxRack = "convox.buildit.tools"
      def convoxPassword = "PqSKzNqXXbKuuJspbXZBUIRGSAtlER"
      def appUrl = "http://synapse.buildit.tools"

      // global for exception handling
      slackChannel = "midas_project"
      gitUrl = "https://bitbucket.org/digitalrigbitbucketteam/synapse"

    stage "Write docker-compose"
      // global for exception handling
      tag = ui.selectTag(ecr.imageTags(appName, awsRegion))
      def tmpFile = UUID.randomUUID().toString() + ".tmp"
      def ymlData = template.transform(readFile("docker-compose.yml.template"), [tag :tag])

      writeFile(file: tmpFile, text: ymlData)

    stage "Deploy to production"
      sh "convox login ${convoxRack} --password ${convoxPassword}"
      sh "convox deploy --app ${appName} --description '${tag}' --file ${tmpFile}"
      sh "rm ${tmpFile}"

      slack.notify("Deployed to Production", "Tag <${gitUrl}/commits/tag/\'${tag}\'|\'${tag}\'> has been deployed to <${appUrl}|${appUrl}>", "good", "http://i296.photobucket.com/albums/mm200/kingzain/the_eye_of_sauron_by_stirzocular-d86f0oo_zpslnqbwhv2.png", slackChannel)
  }
  catch (err) {
    currentBuild.result = "FAILURE"
    slack.notify("Error while deploying to Production", "Tag <${gitUrl}/commits/tag/\'${tag}\'|\'${tag}\'> failed to deploy.", "danger", "http://i296.photobucket.com/albums/mm200/kingzain/the_eye_of_sauron_by_stirzocular-d86f0oo_zpslnqbwhv2.png", slackChannel)
    throw err
  }
}
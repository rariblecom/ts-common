pipeline {
  agent none

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('test') {
      environment {
	      NPM_TOKEN = "na"
      }
      agent any
      steps {
				sh 'yarn'
				sh 'yarn bootstrap'
				sh 'yarn clean'
				sh 'yarn build-all'
				sh 'yarn test'
      }
    }
    stage('build and deploy') {
      agent any
      when {
        branch "master"
      }
      steps {
        withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
					sh 'yarn publish-all'
        }
      }
    }
  }
  post {
    always {
      node("") {
        cleanWs()
      }
    }
  }
}

pipeline {
	agent any

    environment {
		DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        IMAGE_BACKEND = 'hungvo2410/tevc_cms_api'
        IMAGE_FRONTEND = 'hungvo2410/tevc_cms_app'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
		stage('Checkout') {
			steps {
				git url: 'https://github.com/phihungvo/tevc_cms.git', branch: 'main', credentialsId: 'github-cred'
            }
        }

        stage('Build Backend') {
			steps {
				dir('tevc_cms_api') {
					withMaven(maven: 'Maven-3.8') {
						sh 'mvn clean package -DskipTests'
                    }
                }
            }
        }

        stage('Build Frontend') {
			steps {
				dir('tevc_cms_app') {
					sh 'docker run --rm -v $(pwd):/app -w /app docker:20.10.21-dind sh -c "docker build --build-arg REACT_APP_API_URL=/api -t hungvo2410/tevc_cms_app:${TAG} ."'
                }
            }
        }

        stage('Push Images') {
			steps {
				sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${IMAGE_BACKEND}:${TAG}"
                sh "docker push ${IMAGE_FRONTEND}:${TAG}"
                sh "docker tag ${IMAGE_BACKEND}:${TAG} ${IMAGE_BACKEND}:latest"
                sh "docker tag ${IMAGE_FRONTEND}:${TAG} ${IMAGE_FRONTEND}:latest"
                sh "docker push ${IMAGE_BACKEND}:latest"
                sh "docker push ${IMAGE_FRONTEND}:latest"
            }
        }

        stage('Deploy') {
			steps {
				sh 'docker-compose -f docker-compose.prod.yml down'
                sh 'docker-compose -f docker-compose.prod.yml up -d'
            }
        }
    }

    post {
		always {
			cleanWs()
        }
    }
}
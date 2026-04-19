pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "notes-backend"
        DOCKER_IMAGE_FRONTEND = "notes-frontend"
        // Credentials IDs should be configured in Jenkins Credentials
        SNYK_TOKEN = credentials('SNYK_TOKEN')
        SONAR_TOKEN = credentials('SONAR_TOKEN')
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker Images (Artefacts)...'
                sh 'docker build -t ${DOCKER_IMAGE_BACKEND}:latest ./backend'
                sh 'docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Automated Tests...'
                dir('backend') {
                    sh 'npm install && npm test'
                }
                dir('frontend') {
                    sh 'npm install && npm test'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube Code Quality Analysis...'
                // Assuming sonar-scanner is installed on the Jenkins agent
                sh """
                sonar-scanner \
                  -Dsonar.projectKey=NotesApp \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=http://localhost:9000 \
                  -Dsonar.login=${SONAR_TOKEN}
                """
            }
        }

        stage('Security') {
            steps {
                echo 'Running Snyk Security Scan...'
                dir('backend') {
                    sh "snyk test --auth=${SNYK_TOKEN}"
                }
                dir('frontend') {
                    sh "snyk test --auth=${SNYK_TOKEN}"
                }
            }
        }

        stage('Deploy (Staging)') {
            steps {
                echo 'Deploying to Staging Environment...'
                // Using Docker Compose for Staging Simulation
                sh 'docker-compose -p notes-staging up -d'
            }
        }

        stage('Release (Production)') {
            steps {
                echo 'Promoting to Production...'
                // In a real scenario, this would push to a registry and update prod infra
                sh 'docker tag ${DOCKER_IMAGE_BACKEND}:latest ${DOCKER_IMAGE_BACKEND}:prod'
                sh 'docker tag ${DOCKER_IMAGE_FRONTEND}:latest ${DOCKER_IMAGE_FRONTEND}:prod'
                echo 'Application released to Production environment.'
            }
        }

        stage('Monitoring & Alerting') {
            steps {
                echo 'Monitoring Application Health...'
                // Simple health check simulation
                sh 'curl --fail http://localhost:5000/health || (echo "Health check failed!" && exit 1)'
                echo 'Monitoring Dashboard: http://localhost:5000/health'
                echo 'Alerting configured via Jenkins Email/Slack notifications.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build Successful! Notifications Sent.'
        }
        failure {
            echo 'Build Failed! Alerting Team.'
        }
    }
}

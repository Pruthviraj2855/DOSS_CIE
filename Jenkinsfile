pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Student Task Manager source code...'
                checkout scm
            }
        }

        stage('Validate Application') {
            steps {
                echo 'Validating application files...'

                bat 'if not exist index.html exit /b 1'
                bat 'if not exist style.css exit /b 1'
                bat 'if not exist script.js exit /b 1'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'

                bat 'docker build -t student-task-manager:latest .'
            }
        }

        stage('Verify Docker Image') {
            steps {
                echo 'Verifying the generated Docker image...'

                bat 'docker image inspect student-task-manager:latest'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output for details.'
        }
    }
}
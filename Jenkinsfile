
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code retrieved from GitHub'
                bat 'git status'
            }
        }

        stage('Build') {
            steps {
                bat '''
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $source = (Get-Location).Path; $dest = Join-Path $source 'dist'; New-Item -ItemType Directory -Force -Path $dest | Out-Null; Get-ChildItem -Force $source | Where-Object { $_.Name -notin @('.git', 'dist', 'node_modules', 'deployment', 'Jenkinsfile') } | Copy-Item -Destination $dest -Recurse -Force; if (!(Test-Path (Join-Path $dest 'index.html'))) { throw 'index.html not found in repository root or copied output' }; Write-Host 'Build successful: website files copied to dist'"
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; if (!(Test-Path 'dist/index.html')) { throw 'HTML entry point missing' }; $js = @(Get-ChildItem 'dist' -Recurse -Filter '*.js' -File); if ($js.Count -eq 0) { Write-Host 'No JavaScript files found; skipping JS syntax checks' } elseif (Get-Command node -ErrorAction SilentlyContinue) { foreach ($file in $js) { node --check $file.FullName; if ($LASTEXITCODE -ne 0) { throw ('JavaScript syntax check failed: ' + $file.Name) } }; Write-Host 'JavaScript syntax checks passed' } else { Write-Host 'Node.js not installed; skipping JavaScript syntax checks' }; Write-Host 'Required HTML file check passed'"
                '''
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $target = 'C:\\JenkinsDeploy'; New-Item -ItemType Directory -Force -Path $target | Out-Null; Get-ChildItem -Force $target | Remove-Item -Recurse -Force; Get-ChildItem -Force 'dist' | Copy-Item -Destination $target -Recurse -Force; if (!(Test-Path (Join-Path $target 'index.html'))) { throw 'Deployment verification failed: index.html missing' }; Write-Host ('Deployment successful: ' + $target)"
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully'
        }
        failure {
            echo 'Pipeline failed. Check Console Output for details.'
        }
    }
}

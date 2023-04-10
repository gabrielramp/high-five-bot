# Define the log directory and filename format
$logDir = "logs"
$logFormat = "StartupMM-dd-yy_HHmm"

# Create the log directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# Generate the log filename based on the current date and time
$logFilename = Join-Path $logDir ("log-" + (Get-Date -Format $logFormat) + ".txt")

# Run the npm command and save the output to the log file
npm run dev | tee $logFilename
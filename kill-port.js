const { execSync } = require('child_process');

function killProcessOnPort(port) {
  try {
    // Find process using the port
    const findCommand = `netstat -ano | findstr :${port}`;
    const output = execSync(findCommand, { encoding: 'utf8' });
    
    // Extract PID from the output
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes(`LISTENING`)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          console.log(`Found process ${pid} using port ${port}`);
          
          // Kill the process
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`Successfully killed process ${pid}`);
            return true;
          } catch (killError) {
            console.error(`Failed to kill process ${pid}: ${killError.message}`);
          }
        }
      }
    }
    console.log(`No process found using port ${port}`);
    return false;
  } catch (error) {
    console.log(`No process found using port ${port}`);
    return false;
  }
}

// Kill processes on both backend and frontend ports
killProcessOnPort(5001);

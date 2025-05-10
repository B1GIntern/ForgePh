const { execSync } = require('child_process');

// Ports to kill processes on
const PORTS_TO_KILL = [5001, 8080]; // backend and frontend ports

function killProcessOnPort(port) {
  try {
    console.log(`Checking for processes on port ${port}...`);
    
    // Find process using the port
    const findCommand = `netstat -ano | findstr :${port}`;
    const output = execSync(findCommand, { encoding: 'utf8' });
    
    // Extract PID from the output
    const lines = output.split('\n');
    let killedAny = false;
    
    for (const line of lines) {
      if (line.includes(`LISTENING`)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          console.log(`Found process ${pid} using port ${port}`);
          
          // Kill the process
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`Successfully killed process ${pid} on port ${port}`);
            killedAny = true;
          } catch (killError) {
            console.error(`Failed to kill process ${pid}: ${killError.message}`);
          }
        }
      }
    }
    
    if (!killedAny) {
      console.log(`No processes found using port ${port}`);
    }
    
    return killedAny;
  } catch (error) {
    console.log(`No processes found using port ${port}`);
    return false;
  }
}

// Kill all specified ports
console.log('Clearing ports for development...');
PORTS_TO_KILL.forEach(port => killProcessOnPort(port));
console.log('Port cleanup complete.');

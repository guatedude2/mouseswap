const execSync = require('child_process').execSync;

module.exports = {
  getUserFullName() {
   return execSync('id -F').toString('utf8').trim();
  },

  getComputerName() {
    const data =  execSync('system_profiler SPHardwareDataType').toString('utf8');
    const matches = data.match(/Model Name: ([^\n]+)/);
    return matches && matches[1] || null;

  }
}

//id -F
//system_profiler SPHardwareDataType | grep "Model Name"


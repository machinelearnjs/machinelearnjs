const cp = require("child_process");


function isDockerInstalled() {
    let result = true
    try {
        cp.execSync("docker version")
    } catch (err) {
        result = false
    }
    return result
}

async function runIntegrationTests() {

    if (isDockerInstalled()) {
        const cmds = [
            {
                comment: "1. building a kalimdor docker image",
                cmd: "docker build -t kalimdor:latest ."
            },
            {
                comment: "2. Running build-prod.sh in a temporary container",
                cmd: "docker run --rm -it kalimdor:latest './scripts/build-prod.sh'"
            },
        ]

        cmds.forEach(cmd => {
            console.log(cmd.comment)
            cp.execSync(cmd.cmd, {stdio:[0,1,2]})
        })
    } else {
        console.warn("Docker does not seem to be properly installed. Skipping integration tests.")
    }
}

runIntegrationTests()
    .then(() => {
        console.log("PASS Integration tests")
    })
    .catch(() => {
        console.error("FAILED Integration tests")
        process.exitCode = 1;
    })
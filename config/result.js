const https = require("https");
const REPO_FILE = "./repo.txt";
const UNIT_TEST_RESULT_PATH = "../results.json";
const SCORE_PATH = "./scores.json";

const scores = require(SCORE_PATH);
const unitTest = require(UNIT_TEST_RESULT_PATH);
const lineReader = require("line-reader");

const getCommitId = filePath => {
  return new Promise((resolve, reject) => {
    lineReader.eachLine(filePath, line => {
      resolve(line);
    });
  });
};

const postData = async () => {
  const repoName = process.env.CODE_COMMIT_REPO;
  const { testResults, startTime, numTotalTests, success } = unitTest;

  const summary = {
    date: new Date(startTime),
    numTotalTests,
    success
  };

  const bugFixing = [];
  const featureImplementation = [];

  for (result in testResults) {
    currentTest = testResults[result].assertionResults;

    for (assertionResult in currentTest) {
      scoreData = scores.bugs.find(score => { return currentTest[assertionResult].title === score.desc });
      if (scoreData === undefined) {
        scoreData = scores.features.find(score => { return currentTest[assertionResult].title === score.desc });
        if (scoreData !== undefined) {
          featureImplementation.push({
            fullName: currentTest[assertionResult].title,
            success: currentTest[assertionResult].status == "passed" ? true : false,
            score: scoreData.score,
            suite: currentTest[assertionResult].ancestorTitles[0],
          });
        }
      } else {
        bugFixing.push({
          fullName: currentTest[assertionResult].title,
          success: currentTest[assertionResult].status == "passed" ? true : false,
          score: scoreData.score,
          suite: currentTest[assertionResult].ancestorTitles[0],
        });
      }
    }
  }
  const params = {
    repoName,
    summary,
    bugFixing,
    featureImplementation
  }
  return params;
};

const sendReportData = async () => {
  const data = await postData();
  console.log(data);
  const options = {
    hostname: "dev.devgrade.io",
    path: "/assessments/report",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(data))
    }
  };

  const req = https.request(options, res => { });

  req.write(JSON.stringify(data));
  req.end();
};

sendReportData();
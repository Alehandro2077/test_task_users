const fs = require("fs");
const path = require("path");

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json")));
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sample_data.json"))
);

const sampleEmails = sampleData
  .map((entry) => entry.email)
  .filter((email) => email !== null);

function generateRegexFromName(name) {
  const nameParts = name.toLowerCase().split(/\s+/);
  const regexPatterns = [
    `${nameParts[0]}.*${nameParts[1]}`,
    `${nameParts[1]}.*${nameParts[0]}`,
    `${nameParts[0]}`,
    `${nameParts[1]}`,
  ].map((pattern) => pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  return new RegExp(regexPatterns.join("|"), "i");
}

const recognized = [];
let notRecognized = [...sampleEmails];

users.forEach((user) => {
  const userRegex = generateRegexFromName(user.name);
  const relatedEmails = sampleEmails.filter((email) => userRegex.test(email));

  if (relatedEmails.length > 0) {
    recognized.push({
      user_email: user.email,
      related_emails: relatedEmails,
    });

    notRecognized = notRecognized.filter(
      (email) => !relatedEmails.includes(email)
    );
  }
});

const output = {
  recognized,
  not_recognized: notRecognized,
};

fs.writeFileSync(
  path.join(__dirname, "output.json"),
  JSON.stringify(output, null, 2)
);

console.log("Result in output.json");

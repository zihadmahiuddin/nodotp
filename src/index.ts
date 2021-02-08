import conf from "conf";
import inquirer from "inquirer";

import PasscodeGenerator from "./PasscodeGenerator";
import TotpCounter from "./TotpCounter";

import { Account } from "./types";
import { decryptAccountSecret, encryptAccountSecret } from "./crypto";

const ACTIONS = {
  ADD_ACCOUNT: "Add an account",
  VIEW_CODES: "View existing codes",
  EXIT: "Exit",
};

const config = new conf();

const totpCounter = new TotpCounter(30);

async function main() {
  const { action } = await inquirer.prompt([
    {
      message: "What would you like to do?",
      choices: Object.values(ACTIONS),
      name: "action",
      type: "list",
    },
  ]);
  if (action === ACTIONS.ADD_ACCOUNT) {
    const { code, name } = await inquirer.prompt([
      {
        message: "Enter name",
        name: "name",
      },
      {
        message: "Enter code",
        name: "code",
        type: "password",
      },
    ]);
    const accounts = config.get("accounts", []) as Account[];
    if (accounts.some((x) => x.secret === code)) {
      console.error("Account already exists.");
    } else {
      accounts.push({
        identifier: name,
        secret: await encryptAccountSecret(code.replace(/ /g, "")),
      });
      config.set("accounts", accounts);
      console.log("Account added!");
    }
  } else if (action === ACTIONS.VIEW_CODES) {
    const accounts = config.get("accounts", []) as Account[];
    if (!accounts.length) {
      console.log("No accounts found. Try adding an account first!");
    } else {
      for (const account of accounts) {
        const passcodeGenerator = new PasscodeGenerator(
          await decryptAccountSecret(account.secret)
        );
        console.log(
          `${account.identifier} - ${passcodeGenerator.generateResponseCode(
            totpCounter.getValue()
          )}`
        );
      }
    }
  } else if (action === ACTIONS.EXIT) {
    console.log("Thank you for using this program. Exiting now...");
    process.exit(0);
  } else {
    console.error("Unknown action chosen. Please try again.");
  }
  main().catch(console.error);
}

main().catch(console.error);

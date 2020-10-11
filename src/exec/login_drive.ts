import fs from "fs";
import { createNewOauthClient, TOKENS_PATH } from "../lib/drive";
import { askQuestionViaStdin } from "../lib/utils";

(async () => {
    const oauth2Client = await createNewOauthClient();

    const scopes = ["https://www.googleapis.com/auth/drive"];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });

    console.log(`Please access ${url} and obtain your access token.`);
    const accessCode = await askQuestionViaStdin(
        "Enter the code you obtained: "
    );
    const { tokens } = await oauth2Client.getToken(accessCode);
    await fs.promises.writeFile(TOKENS_PATH, JSON.stringify(tokens));
    console.log("Successfully saved tokens to tokens.json");
})().catch(console.error);

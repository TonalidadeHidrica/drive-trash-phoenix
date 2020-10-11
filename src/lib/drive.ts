import { drive_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import Drive = drive_v3.Drive;

export const CLIENT_SECRET_PATH = "./.google/client_secret.json";
export const TOKENS_PATH = "./.google/tokens.json";

let client_secret: null | { installed: ClientSecret } = null;

interface ClientSecret {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
}

export const createNewOauthClient = async (): Promise<OAuth2Client> => {
    if (client_secret == null) {
        client_secret = JSON.parse(
            await fs.promises.readFile(CLIENT_SECRET_PATH, "utf-8")
        );
    }
    if (client_secret == null) {
        throw new Error(`Failed to load ${CLIENT_SECRET_PATH}`);
    }
    return new google.auth.OAuth2(
        client_secret.installed.client_id,
        client_secret.installed.client_secret,
        "urn:ietf:wg:oauth:2.0:oob"
    );
};

const createOauth2Client = async () => {
    const oauth2Client = await createNewOauthClient();
    oauth2Client.setCredentials(
        JSON.parse(await fs.promises.readFile(TOKENS_PATH, "utf-8"))
    );
    oauth2Client.on("tokens", async (tokens) => {
        // if (tokens.refresh_token) {
        //     // store the refresh_token in my database!
        //     console.log(tokens.refresh_token);
        // }
        // console.log(tokens.access_token);
        // console.log("Tokens has been refreshed:");
        // console.log(JSON.stringify(tokens));

        const oldTokens = JSON.parse(
            await fs.promises.readFile(TOKENS_PATH, "utf-8")
        );
        const newTokens = Object.assign({}, oldTokens, tokens);
        await fs.promises.writeFile(TOKENS_PATH, JSON.stringify(newTokens));

        console.log("Tokens has been refreshed.");
    });
    return oauth2Client;
};

export const createDriveClient = async (): Promise<Drive> => {
    return google.drive({ version: "v3", auth: await createOauth2Client() });
};

import { createDriveClient } from "./lib/drive";

(async () => {
    const drive = await createDriveClient();
    const { data } = await drive.files.list({
        q: "trashed = true",
        fields: "nextPageToken,incompleteSearch,files(id,name,parents)",
    });
    const { files } = data;
    console.log(data.nextPageToken, data.incompleteSearch);
    for (const file of files!) {
        console.log(file);
    }
})().catch(console.error);

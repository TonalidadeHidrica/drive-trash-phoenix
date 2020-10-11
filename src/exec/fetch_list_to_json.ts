import fs from "fs";
import { createDriveClient } from "../lib/drive";

(async () => {
    const drive = await createDriveClient();

    const allFiles = [];

    for (let pageToken = undefined; ; ) {
        const { data } = await drive.files.list({
            pageSize: 1000,
            q: "trashed = true",
            fields: "nextPageToken,files(id,name,parents)",
            pageToken,
        });
        const { files } = data;
        console.log(data.nextPageToken);
        allFiles.push(...files!);
        if (data.nextPageToken) pageToken = data.nextPageToken as string;
        else break;
        console.log(allFiles.length);
    }

    await fs.promises.writeFile(
        ".google/file_list.json",
        JSON.stringify(allFiles)
    );
})().catch(console.error);

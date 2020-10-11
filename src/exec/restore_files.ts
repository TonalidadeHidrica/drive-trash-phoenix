import fs from "fs";
import { createDriveClient } from "../lib/drive";
import { drive_v3 } from "googleapis";

(async () => {
    const [, , jsonFilePath, trashFolderId, startIndexStr] = process.argv;
    if (!jsonFilePath || !trashFolderId) {
        console.error("Usage: hoge.ts [jsonFilePath] [trashFolderId]");
    }
    const start = startIndexStr ? Number.parseInt(startIndexStr) : 0;

    const drive = await createDriveClient();

    const allFiles: drive_v3.Schema$File[] = JSON.parse(
        await fs.promises.readFile(jsonFilePath, "utf-8")
    );
    const fileSet = new Set(allFiles.map((file) => file.id!));
    for (const [i, file] of allFiles.entries()) {
        if (i < start) continue;
        await drive.files.update({
            fileId: file.id!,
            addParents: trashFolderId,
            removeParents: file.parents
                ?.filter((id) => fileSet.has(id))
                .join(","),
            requestBody: {
                trashed: false,
            },
        });
        console.log(new Date(), i);
    }
})().catch(console.error);

import * as functions from "firebase-functions";
import { v1 } from "@google-cloud/video-transcoder";

const transcoderClient = new v1.TranscoderServiceClient();

exports.transcodeToHLS = functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    console.log(filePath);
    if(!filePath?.endsWith(".mp4") || filePath.endsWith(".mkv") || filePath.endsWith(".mov")){
        return;
    }
    if(!filePath){
        return;
    }

    const inputUri = `gs://${filePath}`;
    const preset = "hd-vid";
    const location = "us-central1";
    const projectId = "project-id";

    const req = {
        parent: transcoderClient.locationPath(projectId, location),
        job: {
            inputUri: inputUri,
            outputUri: "gs://",
            templateId: preset,
        },
    };

    // 3. Submit transcoding job and handle errors
    try {
        const job = await transcoderClient.createJob(req);

        console.log(`Job created: ${job[0].name}`);
        const jobId = job[0].templateId ?? "";
        console.log("Here",projectId, location, jobId)
        // const [response] = await transcoderClient.getJob({
        //     name: transcoderClient.jobPath(projectId, location, jobId),
        // });
        // console.log(`Job state: ${response.state}`);
    } catch (error) {
        console.error("Error:", error);
        // Handle potential errors
    }

    // 4. Optional: Cleanup
    // ... (delete original video if needed)
});

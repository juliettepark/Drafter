import express from "express";
import { createNewDraft, isNewID, makePick, retrieveDraft} from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
// app.get("/api/dummy", Dummy);
app.get("/api/retrieveDraft", retrieveDraft);
app.get("/api/isNewID", isNewID);
app.post("/api/createDraft", createNewDraft);
app.post("/api/makePick", makePick);
app.listen(port, () => console.log(`Server listening on ${port}`));

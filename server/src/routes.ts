// Juliette Park
// June 2023
// Drafter Project

import { Request, Response } from "express";

// Description of an individual Draft
// RI: # of draft items >= rounds * # drafters
//     # drafters >= 1
export type Draft = {
  draftOptions: string[]; // current possible options
  // drafters: Drafter[];    // List of drafters. Each drafter has name and picked options
  drafters: string[];
  totalRounds: number;    // how many rounds Draft will last
  currRound: number;      // which round pick
  currDrafter: string;    // whose turn it is to pick
  picksSoFar: string[];
};

// Map from draft ID to details of the Draft.
const allDrafts: Map<string, Draft> = new Map();

/**
 * Retrieves the Draft object under a given draft ID.
 * @param req Request from client
 * @param res Response back to client
 * @requires req.query to contain draftID parameter holding an
 *           existing draft ID
 * @returns Record containing {requestedDraft: Draft}
 */
export function retrieveDraft(req: Request, res: Response) {
  const draftID = req.query.draftID;

  // Parameters error
  if (draftID === undefined || typeof draftID !== 'string') {
    res.status(400).send("missing draft 'ID' parameter");
    return;
  }

  // Invalid draftID. Does not exist among our files.
  if (!allDrafts.has(draftID)) {
    res.status(400).send(`name for file called ${draftID} does not exist`);
    return;
  }

  // just in case
  if(allDrafts.get(draftID) === undefined) {
    res.status(400).send("Draft ${draftID} is not in stored drafts");
    return;
  }

  // Successfully found draft under that ID
  res.send({requestedDraft: allDrafts.get(draftID)});
}
/**
 * Indicates if a given ID is unique or if it already exists in the server.
 * @param req Request from client
 * @param res Response back to client
 * @requires req.query to contain checkID parameter holding an
 *           possible draft ID to check
 * @returns Record containing {isANewID: boolean}
 */
export function isNewID(req: Request, res: Response) {
  const possibleID = req.query.checkID;
  if (possibleID === undefined || typeof possibleID !== 'string') {
    res.status(400).send("missing draft 'checkID' parameter");
    return;
  }

  res.send({isANewID: !allDrafts.has(possibleID)});
}

/**
 * Creates a new draft in the server. 
 * @param req Request from client
 * @param res Response back to client
 * @returns Record containing {draft: newDraft, draftID: givenID} OR
 *          "Draft already exists" if existing ID.
 * @requires req.query to contain id, options, drafters, and rounds
 *           parameters that are valid. (preserves Draft RI and have been
 *           JSON.stringify - ed)
 * @requires req.query.drafters number of drafters must be at least 1
 * @modifies allDrafts
 * @effects alldrafts to store a new mapping from the given ID to the
 *          newly created Draft
 */
export function createNewDraft(req: Request, res: Response) {
  
  // VERIFY ID
  const givenID = req.query.id;
  if (givenID === undefined || typeof givenID !== 'string') {
    // console.log("missing id");
    res.status(400).send("missing 'id' parameter");
    return;
  }

  // ID EXISTING
  if (allDrafts.has(givenID)) {
    // console.log("id already exists!!");
    // res.status(400).send("Draft already exists");

    // Use this to catch error in client
    res.send("Draft already exists");
    return;
  }

  // VERIFY OPTIONS
  const optionsString = req.query.options;
  if (optionsString === undefined || typeof optionsString !== 'string') {
    // console.log("missing options");
    res.status(400).send("missing 'options' parameter");
    return;
  }

  // have an options parameter, convert to string[] of options
  const givenOptions: string[] = JSON.parse(optionsString).slice(0);  // slice just because

  // VERIFY DRAFTERS
  const draftersString = req.query.drafters;
  if (draftersString === undefined || typeof draftersString !== 'string') {
    // console.log("missing drafters");
    res.status(400).send("missing 'drafters' parameter");
    return;
  }
  // MUST HAVE AT LEAST 1 DRAFTER
  // Verify in RI tests below
  const givenDrafters: string[] = JSON.parse(draftersString).slice(0);

  // VERIFY ROUNDS
  const roundsString = req.query.rounds;
  if(roundsString === undefined || typeof roundsString !== 'string') {
    // console.log("missing rounds");
    res.status(400).send("missing 'rounds' parameter");
    return;
  }
  if (isNaN(parseInt(roundsString))) {
    // console.log("invalid rounds");
    res.status(400).send(`invalid rounds: ${parseInt(roundsString)}`);
    return;
  }
  const givenRounds: number = parseInt(roundsString);

  // Verify RI
  // RI: # of draft items >= rounds * # drafters
  //     # drafters >= 1
  if(givenOptions.length < givenRounds*givenDrafters.length) {
    // console.log("RI");
    res.status(400).send("RI violated. Invalid options or rounds/drafters");
    return;
  }
  if(givenDrafters.length < 1) {
    // console.log("RI");
    res.status(400).send(`RI: invalid number of drafters: ${givenDrafters.length}`);
    return;
  }

  // Now, all is well, create a new Draft object
  const newDraft: Draft = {
    draftOptions: givenOptions,
    drafters: givenDrafters,
    totalRounds: givenRounds*givenDrafters.length,
    currRound: 1,
    currDrafter: givenDrafters[0],
    picksSoFar: []  // start with no picks
  };

  allDrafts.set(givenID, newDraft);
  // res.send({draft: newDraft, draftID: givenID});
  res.send("Draft created successfully");
}

// Given a drafter, draft ID, and their pick, updates the server to reflect the pick
// (most recent Draft should be updated on screen to only allow picking function when it's their turn)
// Goes STRICTLY in order of drafter names inputted.
/**
 * Updates the given Draft to reflect a selection in the draft.
 * Next drafter will be updated as strictly the next name in the list
 * of drafters (or back to the beginning)
 * @param req Request from client
 * @param res Response back to client
 * @requires req.query to contain valid picker, id, and selection parameters
 *           (picker must be current picker)
 * @modifies allDrafts
 * @effects allDrafts.get(ID) will now store a new draft with the drafter
 *          incremented and the pick added to the list of picks.
 * @returns Record containing {draft: Draft, message: "Draft edited successfully"}
 */
export function makePick(req: Request, res: Response) {
  // delete the pick from the options
  // increase current round (check that round != totalRounds) <-- means draft should be over
  // iterate curr drafter to next in line
  // add to picks so far (copy)

  const picker = req.query.picker;
  if (picker === undefined || typeof picker !== 'string') {
    res.status(400).send("missing draft 'picker' parameter");
    return;
  }

  const givenID = req.query.id;
  if (givenID === undefined || typeof givenID !== 'string') {
    // console.log("missing id from pick");
    res.status(400).send("missing 'id' parameter from pick");
    return;
  }

  const selection = req.query.selection;
  if (selection === undefined || typeof selection !== 'string') {
    // console.log("missing selection");
    res.status(400).send("missing 'selection' parameter");
    return;
  }

  // Now, get the Draft
  const editDraft: Draft | undefined = allDrafts.get(givenID);
  if(editDraft === undefined) {
    // console.log("invalid draft ID from pick");
    res.status(400).send("invalid draft ID from pick");
    return;
  }
  const options: string[] = editDraft.draftOptions.slice(0);
  const oldRound: number = editDraft.currRound;
  const newDrafter: string = getNextDrafter(editDraft);

  if(picker !== editDraft.currDrafter) {
    // console.log("invalid drafter requested pick (should not be possible. Check UI)");
    res.status(400).send("invalid drafter requested pick");
    return;
  }

  if(oldRound > editDraft.totalRounds) {
    // console.log("Draft is over, should not be able to pick");
    res.status(400).send("Draft is over, should not be able to pick");
  }

  const indexOfPick = options.indexOf(selection);
  if(indexOfPick < 0) {
    // console.log("Selection is not among options");
    res.status(400).send("Selection is not among options");
  }
  options.splice(indexOfPick, 1);  // remove that option
  const newPicksSoFar: string[] = editDraft.picksSoFar.slice(0);
  newPicksSoFar.push(selection);

  const editedDraft: Draft = {
    draftOptions: options,
    drafters: editDraft.drafters,  // same
    totalRounds: editDraft.totalRounds,  // same
    currRound: oldRound + 1,
    currDrafter: newDrafter,
    picksSoFar: newPicksSoFar
  };

  allDrafts.set(givenID, editedDraft);
  // res.send("Draft edited successfully");
  // Send actual Draft just for testing
  res.send({draft: editedDraft, message: "Draft edited successfully"});
}

// Get the name of the next drafter in line.
// If current drafter is the last drafter, wrap around to the
// beginning.
// (exported only for testing purposes)
// Parameters: Draft to increment next drafter of
// Return: String name of the next drafter
export function getNextDrafter(editDraft: Draft): string {
  const currDrafter: string = editDraft.currDrafter;
  const allDrafters: string[] = editDraft.drafters;
  // ["jimmy", "timmy", "bob"] length = 3
  // ["jimmy"]
  // if indexOf currDrafter + 1 === allDrafters.length, back to beginning (name at 0)
  // else if, add 1 to currDrafater index < allDrafters.length, add 1 
  const indexOfDrafter: number = allDrafters.indexOf(currDrafter);
  if(indexOfDrafter < 0) {
    throw new Error("drafter is not among drafting names. Should not be able to pick");
  }
  if(indexOfDrafter + 1 >= allDrafters.length) {
    return allDrafters[0];
  } else {
    return allDrafters[indexOfDrafter+1];
  }
}

/**
 * Wipes the files currently stored in the server.
 */
export function reset() {
  allDrafts.clear();
}

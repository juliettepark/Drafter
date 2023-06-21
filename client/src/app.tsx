// Juliette Park
// June 2023
// Drafter Project

import React, { Component } from "react";
import { DraftDetails } from "./draftDetails";
import "./style.css";

export type Page = "create" | "join" | "home" | "rules" | {kind: "displayDraft", username: string, draftID: string}

// Cannot jump into server (compiler doesn't like) so just delcare type again.
// Description of an individual Draft
// RI: # of draft items >= rounds * # drafters
//     # drafters >= 1
export type Draft = {
  draftOptions: string[]; // current possible options
  drafters: string[];     // participants in draft
  totalRounds: number;    // how many rounds Draft will last
  currRound: number;      // which round pick
  currDrafter: string;    // whose turn it is to pick
  picksSoFar: string[];
};

// Current page to show
// and one per user input field.
interface AppState {
  page: Page;
  username: string;
  draftID: string;
  rounds: string;
  options: string;
  drafters: string;
}

// TODO - done
// 1. Ensure RI of Draft (drafters always at least 1, #rounds * #drafters <= #options)
// 2. Ensure we only call pick if round <= #total rounds (should display complete otherwise)
// 3. Return Draft object and reset state holding Draft object each time we want to refresh
// 4. CHANGE ALL CONSOLE.ERRORS TO SHOW USER ERROR MESSAGE
// 5. Update tests for createNewDraft (now returns string message, not the object)
// 6. Re-test routes
// 7. Fix to not show "round, pick, drafter" if no picks so far

// Draft rules:
// Draft goes strictly in order of drafter names given
// Ex. Ronald Donald are drafters, always go Ronald then Donald as drafters
// Draft ID and Drafter names are case-sensitive
// Ex. Penguin and penguin are treated as different ID's and drafters.
// If Ronald tries to join as ronald, will not be recognized.
// No duplicates are allowed in drafter names or draft options.
//   User will be prompted to remove any duplicates before the creation of a draft.


// This App represents a draft.
// Users are able to create a draft, participate in the draft, or simply view
// a draft as spectator.
export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);
    this.state = {page: "home", username:"", draftID:"", drafters:"", options:"", rounds:""};
  }
  
  render = (): JSX.Element => {
    // HOME PAGE
    if(this.state.page === "home") {
      return (<div className="overallBlue">
        <div className="contentCenter">
          <h2 className="homeheader"> Welcome to the Drafter </h2>
          <p className="introDescription">Drafter allows for multiple users to make picks from a pool of options in a fair, controlled environment.<br/>
          Create your own draft for any category (divide up candies, chores, or even simulate sports drafts). <br/>
          </p>
          <p className="descr">Review the draft rules below and select to create a new draft or join an existing one</p>

          {/* <p> Select an action below</p> */}
          {/* <button onClick={this.showCreateScreen}>Create Draft</button>
          <button onClick={this.showJoinScreen}>Join Draft</button>
          <button onClick={this.showRules}>Draft Rules</button> */}
          
          <div className="navigation">
              <ul className="homeButtons">
                  <li><a href="#" onClick={this.showCreateScreen}>Create Draft</a></li>
                  <li><a href="#" onClick={this.showJoinScreen}>Join Draft</a></li>
                  <li><a href="#" onClick={this.showRules}>Draft Rules</a></li>
              </ul>
          </div>
        </div>
        
      </div>);
    } 
    
    // CREATE A DRAFT
    else if(this.state.page === "create") {
      return (
        <div className="overallBlue">
          <h2 className="createHeader">Enter Draft Information to Begin</h2>

          <div className="createInputAllContent">
              <div className="createInputForms">
                <div className="forms">
                <label htmlFor="username">User Name: </label>
                <input className="inputBox" id="username" type="text" value={this.state.username || ''}
                      onChange={this.handleUpdateUserName}></input>
              </div>

              <div className="forms">
                <label htmlFor="id">Draft ID: </label>
                <input className="inputBox" id="id" type="text" value={this.state.draftID || ''}
                      onChange={this.handleUpdateDraftID}></input>
              </div>

              <div className="forms">
                <label htmlFor="rounds">Rounds: </label>
                <input className="inputBox" id="rounds" type="number" value={this.state.rounds} onChange={this.handleRoundsText}></input>
              </div>
            </div>

            <div className="textAreaBoxes">
              <div className="inputBoxes">
                  <label htmlFor="options">Enter draft options<br/>(one option per line)<br/></label>
                <br/>
                <textarea
                  name="options"
                  id="options"
                  rows={20}
                  cols={20}
                  onChange={this.handleOptionsText}
                  value={this.state.options || ''}
                  placeholder="Enter options.">
                </textarea>
              </div>
              <div className="inputBoxes">
                <label htmlFor="drafters">Enter drafter names<br/>(one name per line)<br/></label>
                <br/>
                <textarea
                  name="drafters"
                  id="drafters"
                  rows={20}
                  cols={20}
                  onChange={this.handleDrafterText}
                  value={this.state.drafters || ''}
                  placeholder="Enter drafter names.">
                </textarea>
              </div>
            </div>
          </div>
          
          <div className="createButtons">
            <button className="button" onClick={this.handleCreateDraft}>Create Draft</button>
            <button className="button" onClick={this.handleBack}>Back</button>
          </div>
          
        </div>
      );
    } 
    // JOIN/VIEW A DRAFT
    else if(this.state.page === "join") {
      return (
        <div className="overallBlue">
          <div className="joinContent">
            <h2 className="joinHeader"> Enter draft ID and user name to view a draft</h2>

            <div className="joinPageFormContainer">
              <div className="forms">
                <label>User Name: </label>
                <input className="inputBox" type="text" value={this.state.username || ''}
                      onChange={this.handleUpdateUserName}></input>
              </div>

              <div className="forms">
                <label>Draft ID: </label>
                <input className="inputBox" type="text" value={this.state.draftID || ''}
                      onChange={this.handleUpdateDraftID}></input>
              </div>
            </div>
            
            <div className="navigation">
              <button className="button" onClick={() => this.handleViewDraft(this.state.username.trim(), this.state.draftID.trim())}>View Draft</button>
              <button className="button" onClick={this.handleBack}>Back</button>
            </div>
          </div>
          
        </div>
      );
    } 
    // SEE DRAFT RULES
    else if(this.state.page === "rules") {
      return (
        <div className="rulesOverall">
          <div className="rulesContent">
            <h2 className="rulesHeader">Draft Rules</h2>
            <p>If draft operation is unclear or creation/joining is erroring, please read the following rules!</p>
            <p>
            1. Draft operates strictly in order of drafter names given<br/>
              // Ex. Ronald and Donald are drafters. Ronald will always pick then Donald will pick.
            </p>
            <p>
            2. Draft ID and Drafter names are case-sensitive<br/>
              // Ex. Penguin and penguin are treated as different ID's and drafters.<br/>
              // If Ronald tries to join as ronald, the name will not be recognized.
            </p>
            <p>
            3. No duplicates are allowed in drafter names or draft options.<br/>
              // User will be prompted to remove any duplicates before the creation of a draft.<br/>
            </p>
          </div>
          <button className="button" onClick={this.handleBack}>Back</button>
        </div>
      );
    }
    // DISPLAY DRAFT DETAILS
    // (assumes valid draft ID)
    else {
      return (
        <div>
          <DraftDetails page={this.state.page} onBack={this.handleBack}/>
        </div>
      );
    }
  };

  // Update each addition to the Drafters
  handleDrafterText = (evt: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({drafters: evt.target.value});
  };

  // Update each addition to the Options
  handleOptionsText = (evt: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({options: evt.target.value});
  };

  // Update state to match current rounds input from user
  handleRoundsText = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({rounds: evt.target.value});
  };

  // When user attempts to create a new Draft.
  // Verifies the inputted values are valid.
  // If valid, stores new draft in server and displays the details of draft
  handleCreateDraft = (): void => {

    // If any fields are empty, prompt user to enter
    if(this.state.username.length <= 0) {
      alert("Please enter a username");
      return;
    } else if(this.state.draftID.length <= 0) {
      alert("Please enter a draft ID");
      return;
    } else if(this.state.options.length <= 0) {
      alert("Please enter options.");
      return;
    } else if(this.state.drafters.length <= 0) {
      alert("Please enter drafters");
      return;
    }

    // VERIFY OPTIONS ARE VALID
    // Parse out string info --> arrays to pass to creation
    // Parse options
    const optionsArr = this.state.options.split('\n');
    const optionsArray: string[] = [];
    // Eliminate any empty strings (like enters or blank lines in form)
    // Inv: optionsArray contains all the non "" element of optionsArr from
    // index 0 .. i-1
    for(let i = 0; i < optionsArr.length; i++) {
      if(optionsArr[i].trim() !== "") {
        optionsArray.push(optionsArr[i].trim());  // ignore any whitespace
      }
    }
    const noDupLen: number = new Set(optionsArray).size;
    if(noDupLen !== optionsArray.length) {
      alert("Please remove duplicates from options.");
      return;
    }

    // VERIFY DRAFTERS ARE VALID
    const draftersArr = this.state.drafters.split('\n');
    const draftersArray: string[] = [];
    // Eliminate any empty strings (like enters or blank lines in form)
    // Inv: draftersArray contains all the non "" element of draftersArr from
    // index 0 .. i-1
    for(let i = 0; i < draftersArr.length; i++) {
      if(draftersArr[i].trim() !== "") {
        draftersArray.push(draftersArr[i].trim());  // ignore any whitespace
      }
    }
    const noDupLenDrafters: number = new Set(draftersArray).size;
    if(noDupLenDrafters !== draftersArray.length) {
      alert("Please remove duplicate drafters or make them unique.");
      return;
    }
    console.log(draftersArray);
    console.log(optionsArray);
    const rounds: number = parseInt(this.state.rounds);

    // VERIFY ROUNDS ARE VALID
    // Rounds must be a positive number
    if(Number.isNaN(rounds) || rounds <= 0) {
      alert("Invalid input for rounds. Please input a positive integer.");
      return;
    }
    // Must have enough options for each player
    if(optionsArray.length < draftersArray.length*rounds) {
      alert("Invalid number of rounds. Enter more options or change rounds.");
      return;
    }

    // Valid inputs,
    // Create the draft:
    const url:string = "/api/createDraft" + 
            "?id=" + encodeURIComponent(this.state.draftID.trim()) +
            "&options=" + encodeURIComponent(JSON.stringify(optionsArray)) +
            "&drafters=" + encodeURIComponent(JSON.stringify(draftersArray)) +
            "&rounds=" + encodeURIComponent(rounds + "");
    
    fetch(url, {method: "POST"}).then((res) => {
      if (res.status === 200) {
        return res.text(); // wait until all return
      } else {
        console.log("fetch createDraft unsuccessful");
        this.handleServerError(res);
        return res.text();
      }
    }).then((res) => {
      if (res === "Draft created successfully") {
        console.log("Draft created successfully!!");
        
        // Display the newly created draft
        this.handleShow(this.state.username.trim(), this.state.draftID.trim());

        // Wipe current state in fields
        this.setState({username:"", draftID:"", drafters:"", options:"", rounds:""});
      } else if(res === "Draft already exists") {
        alert("Invalid draft ID. ID already exists.");
        return;
      }
      else {
        console.log("Draft not saved successfully");
        console.log(res);
        return;
      }
    }).catch(this.handleServerError);
  }

  // Errors when talking to the server
  handleServerError = (_: Response) => {
    console.error("unknown error talking to server");
  };

  // For when users want to join/view an existing draft.
  // Ensures the requested draft ID exists.
  // Displays the draft if ID is valid.
  // Alerts the user if ID is invalid.
  handleViewDraft = (userName: string, id: string): void => {
    // if(this.state.draftID.length > 0 && this.state.username.length > 0) {
    if(id.length > 0 && userName.length > 0) {
      // Only change page and show if ID is valid
      const url:string = "/api/isNewID" + 
            // "?checkID=" + encodeURIComponent(this.state.draftID.trim());
            "?checkID=" + encodeURIComponent(id);
      fetch(url).then((val) => {
          if (val.status === 200) {
            return val.json();
          } else {
            this.handleServerError;
            return val.text();
          }
      }).then((val) => {
          if(typeof val === 'string') {
              console.error("unsuccessful fetch of isNewID");
              console.log(val);
          } else if(typeof val !== "object" || val === null){
              console.error("bad data from /isNewID: not a record", val);
          } else {
              const isUnique = val.isANewID;

              // some more checks, then set state
              // editing page is being opened so change page and filename (these are known when file requested)
              if(isUnique === undefined) {
                  console.error("isUnique answer is undefined");
              } 
              if(!isUnique) {  // we only allow NON unique names (means valid ID)
                this.handleShow(userName, id);
                // this.setState({username:"", draftID:""});
              } else {
                alert("Not a valid draft ID. Ensure capitalization is exact.");
                return;
              }
          }
      });
      
    } else {
      alert("Please enter valid Draft ID and Username.");
      return;
    }
  };

  // INPUT FIELD TRACKERS (store any changes)
  handleUpdateUserName = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({username: evt.target.value});
  };
  handleUpdateDraftID = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({draftID: evt.target.value});
  };

  // HOME PAGE HANDLERS
  // Change to appropriate pages.
  showCreateScreen = ():void => {
    this.setState({page: "create"});
  };
  showJoinScreen = ():void => {
    this.setState({page: "join"});
  };
  showRules = ():void => {
    this.setState({page: "rules"});
  };

  // Handler for when a draft is ready to be displayed
  handleShow = (userName: string, id: string): void => {
    // update state so that next render can know to show display screen
    this.setState({page: {kind: "displayDraft", username: userName, draftID: id}});
  };

  // RETURN TO HOME
  handleBack = (): void => {
    // Wipe the state (since unused) and send back to home
    this.setState({page: "home", username:"", draftID:"", drafters:"", options:"", rounds:""});
  };

}

// Dump
  // checkIDUnique = (): void => {
  //   console.log("checking this ID is unique: __");
  //   console.log(this.state.draftID.trim());
  //   const url:string = "/api/isNewID" + 
  //           "?checkID=" + encodeURIComponent(this.state.draftID.trim());
  //   fetch(url).then((val) => {
  //       if (val.status === 200) {
  //         return val.json();
  //       } else {
  //         this.handleServerError;
  //         return val.text();
  //       }
  //   }).then((val) => {
  //       if(typeof val === 'string') {
  //           console.error("unsuccessful fetch of isNewID");
  //           console.log(val);
  //       } else if(typeof val !== "object" || val === null){
  //           console.error("bad data from /isNewID: not a record", val);
  //       } else {
  //           const isUnique = val.isANewID;

  //           // some more checks, then set state
  //           // editing page is being opened so change page and filename (these are known when file requested)
  //           if(isUnique === undefined) {
  //               console.error("isUnique answer is undefined");
  //           } 
  //           console.log("HERE: unique successful");
  //           console.log(isUnique);
  //           // this.setState({unique: isUnique});
  //           // return;
  //       }
  //   });
  //   return;
  // };



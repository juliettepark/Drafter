// Juliette Park
// June 2023
// Drafter Project

import React, { ChangeEvent, Component } from "react";
import { Draft } from "./app";
import "./style.css";

// Draft in state
// Will only ever display the same ID draft.
// However, draft can be updated so store in state.
interface DraftDetailsState {
    currentDraft: Draft | undefined;
}

interface DraftDetailsProps {
    page: {kind: "displayDraft", username: string, draftID: string},
    //onShow: (username: string, draftID: string) => void,
    onBack: () => void
}

// This class represents the details of an existing Draft.
// Users will be able to make picks or see the status of picks so far.
export class DraftDetails extends Component<DraftDetailsProps, DraftDetailsState> {
    constructor(props: any) {
        super(props);
        this.state = {currentDraft: undefined}
        this.componentDidMount; // load up the Draft
    }

    // So that our draft is in state during first iteration.
    componentDidMount(): void {
        this.handleRetrieveDraft();
    }

    render = (): JSX.Element => {
        // Header is always the same
        const header: JSX.Element = 
            (<div>
                <h2 className="homeheader" id="displayHeader">Status of Draft "{this.props.page.draftID}"</h2>
            </div>);

        const currDraft: Draft | undefined = this.state.currentDraft;

        // Status of Draft.
        // If no picks, will show default ("No picks made yet")
        let status: JSX.Element = <h3>No picks made yet</h3>

        // Make status a table with picked elements if there have been picks made.
        const picksHistory: JSX.Element[] = [];
        if(currDraft?.picksSoFar && currDraft.picksSoFar.length > 0) {
            // Inv. picksHistory stores a row (with round, pick, picker)
            // for each pick from 0..i-1 of picksSoFar
            for (let i = 0; i < currDraft.picksSoFar.length; i++) {
                const pickerName: string = currDraft.drafters[i%currDraft.drafters.length];
                picksHistory.push(
                    <tr key={i}>
                        <td>
                            {/* Round */}
                            {i+1}
                        </td>
                        <td>
                            {/* Pick */}
                            {currDraft.picksSoFar[i]}
                        </td>
                        <td>
                            {/* Picker */}
                            {pickerName}
                        </td>
                    </tr>
                    
                );
            }
            // BUILD DRAFT STATUS TABLE
            status = (
                <table className="pickHistory">
                    <tbody>
                        <tr>
                            {/* Headers */}
                            <th>...Round</th>
                            <th>...Pick</th>
                            <th>...Drafter...</th>
                        </tr>
                        {picksHistory}
                    </tbody>   
                </table>
            );       
        }
        
        // ASSEMBLE THE DETAILS PAGE
        if(currDraft !== undefined) {
            // COMPLETED DRAFT
            if(currDraft.currRound > currDraft.totalRounds) {
                return (
                    <div className="displayOverall">
                        {header}
                        {status}
                        <p>Draft is complete</p>
                        <button className="button" type="button" onClick={this.props.onBack}>Close</button>
                    </div>
                );
            }
            // MY TURN
            if(currDraft.currDrafter === this.props.page.username) {
                const options: JSX.Element[] = [];
                options.push(<option key="default" value="Make a Pick">Make a Pick</option>);
                // Inv: options stores default + all options from index 0..i-1 in draftOptions
                // as option tags.
                for (let i = 0; i < currDraft.draftOptions.length; i++) {
                    options.push(<option key={currDraft.draftOptions[i]} value={currDraft.draftOptions[i]}>{currDraft.draftOptions[i]}</option>);
                }
                return (
                    <div className="displayOverall">
                        {header}
                        {status}
                        <p>It's your pick!</p>
                        <select onChange={this.handleMadePick}>
                            {options}
                        </select>
                        <button className="button" type="button" onClick={this.props.onBack}>Close</button>
                    </div>
                );   
            } 
            // NOT MY TURN, PARTICIPANT DRAFTER
            else if(currDraft.drafters.indexOf(this.props.page.username) >= 0) {
                return (
                    <div className="displayOverall">
                        {header}
                        {status}
                        <p>Waiting for {currDraft.currDrafter} to pick</p>
                        <button className="button" onClick={this.handleRefresh}>Refresh</button>
                        <button className="button" type="button" onClick={this.props.onBack}>Close</button>
                    </div>
                );
            } 
            // SPECTATOR
            else {
                return (
                    <div className="displayOverall">
                        {header}
                        {status}
                        <button className="button" onClick={this.handleRefresh}>Refresh</button>
                        <button className="button" type="button" onClick={this.props.onBack}>Close</button>
                    </div>
                );
            }
        } 
        // SHOULD NOT REACH
        return (
            <div>
                {header}
                <p>Draft is undefined</p>
            </div>
        );     
    };

    // Upon change in selection (from options dropdown)
    // Reflect this change in the server.
    handleMadePick = (evt: ChangeEvent<HTMLSelectElement>): void => {
        // Selection will be among options and not "Make a Pick"
        // because there will be no change if user selects the default again.
        const selection:string = evt.target.value;

        // But just in case, handle this
        if(selection === "Make a Pick") {
            alert("Please choose from the options.");
            return;
        }

        const url: string = "/api/makePick" + 
        "?picker=" + encodeURIComponent(this.props.page.username) +
        "&id=" + encodeURIComponent(this.props.page.draftID) + 
        "&selection=" + encodeURIComponent(selection);

        fetch(url,{method: "POST"}).then((res) => {
        if (res.status === 200) {
            return res.json(); // wait until all return
        } else {
            this.handleServerError(res);
            return res.text();
        }
        }).then((res) => {
        if (typeof res === "string") {
            console.log("Error making pick in server");
            // no alert message because this is a bug
        } else if(typeof res !== "object" || res === null){
            console.error("bad data from /makePick: not a record", res);
        } else {
            // Pick has been made in server so update to most
            // recent version of draft to display.
            this.handleRetrieveDraft();
        }
        }).catch(this.handleServerError);
    }

    // Fetch the requested Draft and set in state.
    // Get the most recent version stored in the server.
    handleRetrieveDraft = (): void => {     
        const url:string = "/api/retrieveDraft" + 
            "?draftID=" + encodeURIComponent(this.props.page.draftID.trim());
        fetch(url).then((val) => {
            if (val.status === 200) {
                return val.json();
            } else {
            this.handleServerError;
                return val.text();
            }
        }).then((val) => {
            if(typeof val === 'string') {
                console.error("unsuccessful fetch of retrieveDraft");
                console.log(val);
            } else if(typeof val !== "object" || val === null){
                console.error("bad data from /retrieveDraft: not a record", val);
            } else {
                const draftObj = val.requestedDraft;
                if(draftObj === undefined) {
                    console.error("Loaded Draft is undefined");
                } else {
                    // Fetch successful
                    // Update the state to this draft.
                    this.setState({currentDraft:draftObj});
                    console.log("Draft loaded successfully");
                }
            }
        });
    };

    // Refreshing the page is just displaying the most
    // recent draft from the server.
    handleRefresh = (): void => {
        this.handleRetrieveDraft();
    };

    // Any errors from talking to server.
    handleServerError = (_: Response) => {
        // TODO: show the error to the user, with more information
        console.error("unknown error talking to server");
    };
};
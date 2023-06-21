import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { createNewDraft, Draft, isNewID, makePick, reset, retrieveDraft, getNextDrafter } from './routes';


describe('routes', function() {

  // it('Dummy', function() {
  //   const req1 = httpMocks.createRequest(
  //       {method: 'GET', url: '/api/dummy', query: {name: 'Kevin'}});
  //   const res1 = httpMocks.createResponse();
  //   Dummy(req1, res1);
  //   assert.strictEqual(res1._getStatusCode(), 200);
  //   assert.deepEqual(res1._getJSONData(), 'Hi, Kevin');
  // });

  // createNewDraft
  it('createNewDraft', function() {
    const id1: string = "candyDraft";
    const options1: string[] = ["snickers", "hershey's", "almond joy"];
    const drafters1: string[] = ["bobby", "timmy", "jimmy"];

    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id1, 
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});

    // --- Test successful draft ---
    const res1 = httpMocks.createResponse();
    createNewDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    // assert.deepEqual(res1._getData(), {draft: expectedDraft1, draftID: id1});
    assert.deepEqual(res1._getData(), 'Draft created successfully');

    // --- Test successful draft ---
    const idZ: string = "treats";
    const optionsZ: string[] = ["nubs", "whimzees", "PB & Bacon", "beef liver", "salmon skin"];
    const draftersZ: string[] = ["cherry", "gongsae"];

    const reqZ = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: idZ, 
              options: JSON.stringify(optionsZ), 
              drafters: JSON.stringify(draftersZ), rounds: "2"
            }});

    const resZ = httpMocks.createResponse();
    createNewDraft(reqZ, resZ);
    assert.strictEqual(resZ._getStatusCode(), 200);
    assert.deepEqual(resZ._getData(), 'Draft created successfully');
    
    // --- Test Existing Draft ---
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id1, 
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    
    const res2 = httpMocks.createResponse();
    createNewDraft(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepEqual(res2._getData(), 'Draft already exists');

    // --- Test Missing queries ---
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    
    const res3 = httpMocks.createResponse();
    createNewDraft(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepEqual(res3._getData(), 'missing \'id\' parameter');

    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{ id: "noOptionsTest",
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    
    const res4 = httpMocks.createResponse();
    createNewDraft(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepEqual(res4._getData(), 'missing \'options\' parameter');

    // Test Verify RI
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{ id: "RITest",
              options: JSON.stringify(options1),
              drafters: JSON.stringify(drafters1), rounds: "8"
            }});
    
    const res5 = httpMocks.createResponse();
    createNewDraft(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepEqual(res5._getData(), 'RI violated. Invalid options or rounds/drafters');

    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{ id: "RITest2",
              options: JSON.stringify(options1),
              drafters: JSON.stringify([]), rounds: "0"
            }});
    
    const res6 = httpMocks.createResponse();
    createNewDraft(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 400);
    assert.deepEqual(res6._getData(), 'RI: invalid number of drafters: 0');

    reset();
  });

  // Test recognizing unqiue vs. existing IDs
  // If unique, returns true, if not unique, returns false
  it('isNewID', function() {

    // ---- Test finds unique ID correctly -----
    const req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/isNewID', query: {checkID: 'icecreamDraft'}});
    const res1 = httpMocks.createResponse();
    isNewID(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {isANewID: true});

    // ---- Test finds unique ID correctly -----
    const req3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/isNewID', query: {checkID: 'sugoi'}});
    const res3 = httpMocks.createResponse();
    isNewID(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepEqual(res3._getData(), {isANewID: true});

    // ---- Test finds existing IDs correctly -----
    const id1: string = "candyDraft";
    // make string of options
    const options1: string[] = ["snickers", "hershey's", "almond joy"];
    // make string of drafter names
    const drafters1: string[] = ["bobby", "timmy", "jimmy"];
    const reqA = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id1, 
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    const resA = httpMocks.createResponse();
    createNewDraft(reqA, resA);

    const req2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/isNewID', query: {checkID: 'candyDraft'}});
    const res2 = httpMocks.createResponse();
    isNewID(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepEqual(res2._getData(), {isANewID: false});

    reset();
  });

  
  // retrieveDraft
  it('retrieveDraft', function() {

    // --- Test successful retrieval ---
    const req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/retrieveDraft', query: {draftID: 'candyDraft'}});

    const id1: string = "candyDraft";
    // make string of options
    const options1: string[] = ["snickers", "hershey's", "almond joy"];
    // make string of drafter names
    const drafters1: string[] = ["bobby", "timmy", "jimmy"];
    const reqA = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id1, 
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    const resA = httpMocks.createResponse();
    createNewDraft(reqA, resA);
    const expectedDraft1: Draft = {
      draftOptions: options1,
      drafters: drafters1,
      totalRounds: 3,
      currRound: 1,
      currDrafter: "bobby",
      picksSoFar: []
    };

    const res1 = httpMocks.createResponse();
    retrieveDraft(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {requestedDraft: expectedDraft1});

    // --- Test successful retrieval ---
    const req2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/retrieveDraft', query: {draftID: 'treats'}});

    const id2: string = "treats";
    // make string of options
    const options2: string[] = ["nubs", "whimzees", "PB & Bacon", "beef liver", "salmon skin"];
    // make string of drafter names
    const drafters2: string[] = ["cherry", "gongsae"];
    const reqB = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id2, 
              options: JSON.stringify(options2), 
              drafters: JSON.stringify(drafters2), rounds: "2"
            }});
    const resB = httpMocks.createResponse();
    createNewDraft(reqB, resB);
    const expectedDraft2: Draft = {
      draftOptions: options2,
      drafters: drafters2,
      totalRounds: 4,
      currRound: 1,
      currDrafter: "cherry",
      picksSoFar: []
    };

    const res2 = httpMocks.createResponse();
    retrieveDraft(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepEqual(res2._getData(), {requestedDraft: expectedDraft2});

    reset();
  });

  it("makePick", function() {

    // --- Test successful picks ---
    const id1: string = "candyDraft";
    const options1: string[] = ["snickers", "hershey's", "almond joy"];
    const drafters1: string[] = ["bobby", "timmy", "jimmy"];
    const reqA = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', 
      query:{id: id1, 
              options: JSON.stringify(options1), 
              drafters: JSON.stringify(drafters1), rounds: "1"
            }});
    const resA = httpMocks.createResponse();
    createNewDraft(reqA, resA);

    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/makePick', query: {picker: "bobby", id: "candyDraft", selection: "hershey's"}});
    const res1 = httpMocks.createResponse();
    makePick(req1, res1);

    const expectedDraft1: Draft = {
      draftOptions: ["snickers", "almond joy"],
      drafters: drafters1,
      totalRounds: 3,
      currRound: 2,
      currDrafter: "timmy",
      picksSoFar: ["hershey's"]
    };

    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getData(), {draft: expectedDraft1, message: "Draft edited successfully"});

    // --- Test successful picks (test iteratation) ---
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/makePick', query: {picker: "timmy", id: "candyDraft", selection: "snickers"}});
    const res2 = httpMocks.createResponse();
    makePick(req2, res2);

    const expectedDraft2: Draft = {
      draftOptions: ["almond joy"],
      drafters: drafters1,
      totalRounds: 3,
      currRound: 3,
      currDrafter: "jimmy",
      picksSoFar: ["hershey's", "snickers"]
    };

    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepEqual(res2._getData(), {draft: expectedDraft2, message: "Draft edited successfully"});

    // --- Test successful picks (test iteratation to back to beginning for drafters) ---
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/makePick', query: {picker: "jimmy", id: "candyDraft", selection: "almond joy"}});
    const res3 = httpMocks.createResponse();
    makePick(req3, res3);

    const expectedDraft3: Draft = {
      draftOptions: [],
      drafters: drafters1,
      totalRounds: 3,
      currRound: 4,
      currDrafter: "bobby",
      picksSoFar: ["hershey's", "snickers", "almond joy"]
    };

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepEqual(res3._getData(), {draft: expectedDraft3, message: "Draft edited successfully"});

    // --- test invalid drafter turn recognized ---
    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/makePick', query: {picker: "jimmy", id: "candyDraft", selection: "almond joy"}});
    const res4 = httpMocks.createResponse();
    makePick(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepEqual(res4._getData(), "invalid drafter requested pick");

    reset();
  });

  it("getNextDrafter", function() {
    // --- Test regular increment ---
    const options1: string[] = ["snickers", "almond joy"];
    const drafters1: string[] = ["bobby", "timmy", "jimmy"];
    
    const draft1: Draft = {
      draftOptions: options1,
      drafters: drafters1,
      totalRounds: 3,
      currRound: 2,
      currDrafter: "timmy",
      picksSoFar: ["hershey's"]
    };

    assert.deepEqual(getNextDrafter(draft1), "jimmy");

    // --- Test regular increment ---
    const draftA: Draft = {
      draftOptions: options1,
      drafters: drafters1,
      totalRounds: 3,
      currRound: 2,
      currDrafter: "bobby",
      picksSoFar: ["hershey's"]
    };

    assert.deepEqual(getNextDrafter(draftA), "timmy");

    // --- Test wrap around ---
    const draft2: Draft = {
      draftOptions: options1,
      drafters: drafters1,
      totalRounds: 3,
      currRound: 3,
      currDrafter: "jimmy",
      picksSoFar: ["hershey's"]
    };

    assert.deepEqual(getNextDrafter(draft2), "bobby");

    // --- Test wrap around ---
    const draft3: Draft = {
      draftOptions: options1,
      drafters: ["cherry", "gongsae"],
      totalRounds: 1,
      currRound: 2,
      currDrafter: "gongsae",
      picksSoFar: ["hershey's"]
    };

    assert.deepEqual(getNextDrafter(draft3), "cherry");
});

});

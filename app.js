const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT
      *
    FROM
     state
      ORDER BY
      state_id;`;
  const stateArray = await db.all(getStateQuery);
  response.send(stateArray);


  app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT
      *
    FROM
      state
    WHERE
      state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});



  app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
  stateId,
  cases,
  cured,
  active,
  deaths,
   
  } = districtDetails;
  const addDistrictQuery = `
    INSERT INTO
      district ( district_name,state_id,cases,cured,active,deaths,)
    VALUES
      (
        '${districtName}',
         ${stateId},
         ${cases},
         ${cured},
         ${active},
         ${deaths},
         
      );`;

  const dbResponse = await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});


app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT
      *
    FROM
     district
    WHERE
      district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
});



app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM
      district
    WHERE
      district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});



app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
     districtName,
  stateId,
  cases,
  cured,
  active,
  deaths,
   
  } = districtDetails;
  const updateDistrictQuery = `
    UPDATE
     district
    SET
       district_name = '${districtName}',
      state_id='${stateId}',
      cases=${cases},
      cured=${cured},
      active=${active},
      deaths=${deaths},
      
    WHERE
       district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});



  app.get("/states/:stateId/stats/", async (request, response) => {
  const getStateQuery = `
    SELECT
      district.cases AS totalCases,
      district.cured AS totalCured,
      district.active AS totalActive,
      district.deaths AS totalDeaths,

    FROM
      district INNER JOIN state ON state.state_id = district.state_id
      ORDER BY
     totalCases;`;
  const stateArray = await db.all(getStateQuery);
  response.send(stateArray);



  app.get("/districts/:districtId/details/", async (request, response) => {
  const getStateQuery = `
    SELECT
      state.state_name AS  stateName 
    FROM
      state INNER JOIN district ON state.state_id = district.state_id
      ORDER BY
     stateName ;`;
  const stateArray = await db.all(getStateQuery);
  response.send(stateArray);


  

module.exports = app;
const pool = require("../config/db");
const { getNextState } = require("./stateMachine");

async function updateOutingState(requestId, action) {

  const result = await pool.query(
    "SELECT status FROM outing_requests WHERE id=$1",
    [requestId]
  );

  if (result.rows.length === 0) {
    throw new Error("Outing not found");
  }

  const currentState = result.rows[0].status;

  const nextState = getNextState(currentState, action);

  if (!nextState) {
    throw new Error("Invalid state transition");
  }

  await pool.query(
    "UPDATE outing_requests SET status=$1 WHERE id=$2",
    [nextState, requestId]
  );

  return nextState;
}

module.exports = updateOutingState;
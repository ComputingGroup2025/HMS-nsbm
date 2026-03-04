const transitions = {

  pending_parent: {
    parentApprove: "pending_warden",
    parentReject: "rejected_by_parent"
  },

  pending_warden: {
    wardenApprove: "approved",
    wardenReject: "rejected_by_warden"
  },

  approved: {
    securityExit: "student_left"
  },

  student_left: {
    securityReturn: "student_returned"
  }

};

function getNextState(currentState, action) {

  const state = transitions[currentState];

  if (!state || !state[action]) {
    return null;
  }

  return state[action];
}

module.exports = {
  getNextState
};